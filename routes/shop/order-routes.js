const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  successPayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/success", successPayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;
