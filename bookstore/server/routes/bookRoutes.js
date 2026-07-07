const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getGenres,
} = require('../controllers/bookController');
const { getReviewsForBook, createReview } = require('../controllers/reviewController');

const router = express.Router();

const bookValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Public
router.get('/', getBooks);
router.get('/genres/list', getGenres);
router.get('/:id', getBookById);

// Nested reviews
router.get('/:bookId/reviews', getReviewsForBook);
router.post(
  '/:bookId/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  createReview
);

// Admin only
router.post('/', protect, authorize('admin'), bookValidation, validate, createBook);
router.put('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
