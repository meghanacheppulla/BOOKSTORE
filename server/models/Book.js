const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 3000,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publishedYear: {
      type: Number,
      min: 1450,
      max: new Date().getFullYear(),
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text', genre: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ ratingAverage: -1 });

module.exports = mongoose.model('Book', bookSchema);
