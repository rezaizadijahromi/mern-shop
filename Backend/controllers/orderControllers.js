import express from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";

// @desc Create order
// @route POST /api/orders
// @access Private

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(404);
    throw new Error("No order item found");
  } else {
    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const newOrder = await order.save();

    res.status(201).json(newOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private

const getOrderById = asyncHandler(async (req, res) => {
  const order = (await Order.findById(req.params.id)).populate(
    "user",
    "user password",
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("No order found");
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id/pay
// @access  Private

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: order.body.update_time,
      email_address: order.body.update_time,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id/deliver
// @access  Private

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = new Order.save();

    res.status(updateOrder);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private

const getMyOrders = asyncHandler(async (req, res) => {
  const order = Order.find({ user: req.user._id });

  if (order) {
    res.status(order);
  } else {
    res.status(404);
    throw new Error("No orders found");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private/Admin

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");

  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error("No orders found");
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
};
