const express = require('express');
const { protect } = require('../middleware/auth');
const { deleteReview } = require('../controllers/reviewController');

const router = express.Router();

// Book-scoped create/read live in bookRoutes.js (/api/books/:bookId/reviews)
router.delete('/:id', protect, deleteReview);

module.exports = router;
