const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { success, error } = require('../utils/apiResponse');

// @route GET /api/books/:bookId/reviews
// @access Public
const getReviewsForBook = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name')
    .sort('-createdAt')
    .lean();
  success(res, 200, { reviews });
});

// @route POST /api/books/:bookId/reviews
// @access Private
const createReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;

  const book = await Book.findById(bookId).lean();
  if (!book) return error(res, 404, 'Book not found');

  const existing = await Review.findOne({ book: bookId, user: req.user._id }).lean();
  if (existing) {
    return error(res, 409, 'You have already reviewed this book');
  }

  const review = await Review.create({
    book: bookId,
    user: req.user._id,
    rating,
    comment,
  });

  success(res, 201, { review }, 'Review submitted');
});

// @route DELETE /api/reviews/:id
// @access Private (owner) or Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).lean();
  if (!review) return error(res, 404, 'Review not found');

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return error(res, 403, 'Not authorized to delete this review');
  }

  await Review.findOneAndDelete({ _id: review._id }); // triggers post hook to recalc rating
  success(res, 200, null, 'Review deleted');
});

module.exports = { getReviewsForBook, createReview, deleteReview };
