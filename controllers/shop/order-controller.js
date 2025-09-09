const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const SSLCommerzPayment = require("sslcommerz-lts");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../models/User");

const tran_id = new mongoose.Types.ObjectId().toString();

const store_id = "comme68bce71bf282e";
const store_passwd = "comme68bce71bf282e@ssl";
const is_live = false;

const successPayment = async (req, res) => {
  try {
    const { id } = req.params;

    let order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentURL = "";

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.redirect(
      `${process.env.FRONTEND_URL}/shop/success-payment?orderId=${order._id}&status=confirmed&amount=${order.totalAmount}`
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const failPayment = async (req, res) => {
  try {
    const { id } = req.params;

    let order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "pending";
    order.orderStatus = "pending";

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.redirect(
      `${process.env.FRONTEND_URL}/shop/failed-payment?orderId=${order._id}&status=pending&amount=${order.totalAmount}`
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;

    let order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "cancelled";
    order.orderStatus = "cancelled";
    order.paymentURL = "";

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.redirect(`${process.env.FRONTEND_URL}/shop/account`);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const createOrder = async (req, res) => {
  const order = req.body;

  const newlyCreatedOrder = new Order({
    userId: order.userId,
    cartId: order.cartId,
    cartItems: order.cartItems,
    addressInfo: order.addressInfo,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    orderUpdateDate: order.orderUpdateDate,
  });

  await newlyCreatedOrder.save();

  const user = await User.findById(order.userId);
  console.log(user);
  const data = {
    total_amount: order.totalAmount,
    currency: "BDT",
    tran_id: tran_id, // use unique tran_id for each api call
    success_url: `${process.env.BACKEND_URL}/api/shop/order/success/${newlyCreatedOrder._id}`,
    fail_url: `${process.env.BACKEND_URL}/api/shop/order/fail/${newlyCreatedOrder._id}`,
    cancel_url: `${process.env.BACKEND_URL}/api/shop/order/cancel/${newlyCreatedOrder._id}`,
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: "Computer.",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: user.userName,
    cus_email: user.email,
    cus_add1: req.body.addressInfo.address,
    cus_add2: req.body.addressInfo.address2 || "N/A",
    cus_city: req.body.addressInfo.city,
    cus_state: req.body.addressInfo.state,
    cus_postcode: req.body.addressInfo.postcode,
    cus_country: req.body.addressInfo.country || "Bangladesh",
    cus_phone: req.body.addressInfo.phone,
    cus_fax: "01711111111",
    ship_name: user.userName,
    ship_add1: req.body.addressInfo.address,
    ship_add2: req.body.addressInfo.address2 || "N/A",
    ship_city: req.body.addressInfo.city,
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz
    .init(data)
    .then(async (apiResponse) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL;

      newlyCreatedOrder.paymentURL = GatewayPageURL;
      await newlyCreatedOrder.save();
      res.send(GatewayPageURL);
    })
    .catch((err) => {
      console.log(err);
    });
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).sort({ orderDate: -1 });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  successPayment,
  getAllOrdersByUser,
  getOrderDetails,
  failPayment,
  cancelPayment,
};
