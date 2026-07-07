const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const { success, error } = require('../utils/apiResponse');

// @route GET /api/books
// Supports: ?keyword=&genre=&author=&minPrice=&maxPrice=&minRating=&sort=&page=&limit=
// @access Public
const getBooks = asyncHandler(async (req, res) => {
  const {
    keyword,
    genre,
    author,
    minPrice,
    maxPrice,
    minRating,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (keyword) {
    filter.$text = { $search: keyword };
  }
  if (genre) filter.genre = new RegExp(`^${genre}$`, 'i');
  if (author) filter.author = new RegExp(author, 'i');
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Book.countDocuments(filter),
  ]);

  success(res, 200, {
    books,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

// @route GET /api/books/:id
// @access Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, { book });
});

// @route POST /api/books
// @access Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create({ ...req.body, createdBy: req.user._id });
  success(res, 201, { book }, 'Book created');
});

// @route PUT /api/books/:id
// @access Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, { book }, 'Book updated');
});

// @route DELETE /api/books/:id
// @access Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, null, 'Book deleted');
});

// @route GET /api/books/genres/list
// @access Public
const getGenres = asyncHandler(async (req, res) => {
  const genres = await Book.distinct('genre');
  success(res, 200, { genres });
});

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook, getGenres };
