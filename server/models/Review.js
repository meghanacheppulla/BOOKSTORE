const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// A user can only review a given book once
reviewSchema.index({ book: 1, user: 1 }, { unique: true });
reviewSchema.index({ book: 1, createdAt: -1 });

// Recalculate the parent book's average rating whenever reviews change.
reviewSchema.statics.recalculateBookRating = async function recalculateBookRating(bookId) {
  const Book = mongoose.model('Book');
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingAverage: stats[0].avgRating,
      ratingCount: stats[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, { ratingAverage: 0, ratingCount: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.recalculateBookRating(this.book);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.recalculateBookRating(doc.book);
});

module.exports = mongoose.model('Review', reviewSchema);
