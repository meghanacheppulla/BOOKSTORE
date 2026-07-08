const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const { success, error } = require('../utils/apiResponse');

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

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, { book });
});

const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create({ ...req.body, createdBy: req.user._id });
  success(res, 201, { book }, 'Book created');
});

const bulkAddBooks = asyncHandler(async (req, res) => {
  const booksData = req.body;
  if (!Array.isArray(booksData) || booksData.length === 0) {
    return error(res, 400, 'Invalid data format or empty array');
  }
  const booksToInsert = booksData.map(book => ({
    ...book,
    createdBy: req.user._id
  }));
  const insertedBooks = await Book.insertMany(booksToInsert);
  success(res, 201, { count: insertedBooks.length }, `${insertedBooks.length} books successfully imported`);
});


const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, { book }, 'Book updated');
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return error(res, 404, 'Book not found');
  success(res, 200, null, 'Book deleted');
});

const getGenres = asyncHandler(async (req, res) => {
  const genres = await Book.distinct('genre');
  success(res, 200, { genres });
});

module.exports = { getBooks, getBookById, createBook, bulkAddBooks, updateBook, deleteBook, getGenres };
