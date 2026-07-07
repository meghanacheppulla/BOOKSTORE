const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { success, error } = require('../utils/apiResponse');

// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return error(res, 400, 'Order must include at least one item');
  }

  // Re-fetch books server-side so price/stock cannot be spoofed by the client.
  const bookIds = items.map((i) => i.book);
  const books = await Book.find({ _id: { $in: bookIds } }).lean();

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const book = books.find((b) => b._id.toString() === item.book);
    if (!book) return error(res, 404, `Book not found: ${item.book}`);
    if (book.stock < item.quantity) {
      return error(res, 400, `Insufficient stock for "${book.title}" (available: ${book.stock})`);
    }
    orderItems.push({
      book: book._id,
      title: book.title,
      price: book.price,
      quantity: item.quantity,
    });
    itemsPrice += book.price * item.quantity;
  }

  const shippingPrice = itemsPrice > 500 ? 0 : 40; // simple flat-rate simulation
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    isPaid: true, // simulated checkout: treated as paid immediately
    paidAt: new Date(),
  });

  // Decrement stock (simulated, non-transactional for simplicity in MVP)
  await Promise.all(
    orderItems.map((oi) => Book.findByIdAndUpdate(oi.book, { $inc: { stock: -oi.quantity } }))
  );

  success(res, 201, { order }, 'Order placed successfully');
});

// @route GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt').lean();
  success(res, 200, { orders });
});

// @route GET /api/orders/:id
// @access Private (owner) or Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').lean();
  if (!order) return error(res, 404, 'Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return error(res, 403, 'Not authorized to view this order');
  }
  success(res, 200, { order });
});

// @route GET /api/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ]);

  success(res, 200, { orders, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
});

// @route PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, 'Order not found');

  order.status = status;
  await order.save();
  success(res, 200, { order }, 'Order status updated');
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
