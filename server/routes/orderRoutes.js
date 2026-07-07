const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.book').isMongoId().withMessage('Invalid book id in order items'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  createOrder
);

router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin
router.get('/', protect, authorize('admin'), getAllOrders);
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status value'),
  ],
  validate,
  updateOrderStatus
);

module.exports = router;
