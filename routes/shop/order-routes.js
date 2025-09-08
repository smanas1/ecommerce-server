const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  successPayment,
  failPayment,
  cancelPayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/success/:id", successPayment);
router.post("/fail/:id", failPayment);
router.post("/cancel/:id", cancelPayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;
