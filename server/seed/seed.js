// Usage:
//   npm run seed          -> wipes Books/Users(non-critical)/Orders/Reviews and inserts sample data
//   npm run seed:destroy  -> wipes all seedable collections without reinserting
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const Order = require('../models/Order');

const books = [
  {
    title: 'The Silent Algorithm',
    author: 'Meera Kapoor',
    description: 'A gripping techno-thriller about an AI that learns to keep secrets.',
    genre: 'Science Fiction',
    price: 349,
    stock: 25,
    isbn: '9780000000001',
    publishedYear: 2022,
  },
  {
    title: 'Curry and Code',
    author: 'Arjun Iyer',
    description: 'A memoir of building startups in Bangalore, one cup of filter coffee at a time.',
    genre: 'Non-fiction',
    price: 299,
    stock: 40,
    isbn: '9780000000002',
    publishedYear: 2021,
  },
  {
    title: 'Monsoon of Memories',
    author: 'Ritu Sharma',
    description: 'A multigenerational family saga set across three monsoons in Kerala.',
    genre: 'Fiction',
    price: 399,
    stock: 15,
    isbn: '9780000000003',
    publishedYear: 2020,
  },
  {
    title: 'DSA Demystified',
    author: 'Pandu Dannina',
    description: 'A practical, problem-first guide to data structures and algorithms.',
    genre: 'Education',
    price: 499,
    stock: 60,
    isbn: '9780000000004',
    publishedYear: 2024,
  },
  {
    title: 'The Last Debugger',
    author: 'Sanjay Rao',
    description: 'In a future where bugs are outlawed, one engineer breaks the rules.',
    genre: 'Science Fiction',
    price: 349,
    stock: 30,
    isbn: '9780000000005',
    publishedYear: 2023,
  },
  {
    title: 'Whispers of the Western Ghats',
    author: 'Lakshmi Nair',
    description: 'A poetic travelogue through India\'s most biodiverse mountain range.',
    genre: 'Travel',
    price: 279,
    stock: 20,
    isbn: '9780000000006',
    publishedYear: 2019,
  },
];

const importData = async () => {
  await connectDB();

  await Promise.all([Review.deleteMany(), Order.deleteMany(), Book.deleteMany()]);

  // Idempotent admin user
  let admin = await User.findOne({ email: (process.env.SEED_ADMIN_EMAIL || 'admin@bookstore.com').toLowerCase() });
  if (!admin) {
    admin = await User.create({
      name: 'Store Admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@bookstore.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Created admin: ${admin.email}`);
  }

  const createdBooks = await Book.insertMany(books.map((b) => ({ ...b, createdBy: admin._id })));
  console.log(`Seeded ${createdBooks.length} books.`);

  console.log('Seed complete.');
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([Review.deleteMany(), Order.deleteMany(), Book.deleteMany()]);
  console.log('All seedable data destroyed (users preserved).');
  process.exit(0);
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
