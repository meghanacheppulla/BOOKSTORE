# 📚 BookStore — MERN Stack Application

A full-stack online bookstore built with **MongoDB, Express, React, and Node.js**.
Users can browse/search books, read and write reviews, add items to a cart, and complete a
simulated checkout. Admins can manage the book catalog and order pipeline from a dedicated
dashboard.

This document is the single source of truth for setup, architecture, API usage, and the
product roadmap.

---

## 1. Tech stack & versions

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Database   | MongoDB 6+ (local or MongoDB Atlas)           |
| Backend    | Node.js 18+ / Express 4 / Mongoose 8          |
| Frontend   | React 18 / Vite 5 / React Router 6            |
| Auth       | JWT (jsonwebtoken) + bcryptjs password hashing|
| Validation | express-validator (server), native HTML5 (client) |
| Styling    | Plain CSS with CSS custom properties (see §7) |

**Verified compatible with:** Node v22.x / npm v10.x (developed and build-tested in this
environment). Anything Node 18 LTS or newer will work.

---

## 2. Project structure

```
bookstore/
├── server/                     # Express + MongoDB API
│   ├── config/db.js            # Mongoose connection
│   ├── models/                 # User, Book, Review, Order schemas
│   ├── middleware/              # auth (JWT/roles), validation, error handling
│   ├── controllers/            # Route handler logic
│   ├── routes/                 # Express routers, mounted in server.js
│   ├── seed/seed.js            # Sample data + admin bootstrap
│   ├── server.js               # App entrypoint
│   ├── .env.example
│   └── package.json
│
├── client/                     # React (Vite) frontend
│   ├── src/
│   │   ├── api/axios.js        # Axios instance + JWT interceptor
│   │   ├── context/            # AuthContext, CartContext (localStorage-backed)
│   │   ├── components/         # BookCard, BookList, Header, ReviewList, CartItem,
│   │   │                       # AdminBookForm, ProtectedRoute
│   │   ├── pages/               # Home, Search, BookDetails, Cart, Checkout, Login,
│   │   │                       # Register, Profile, AdminDashboard
│   │   ├── App.jsx / main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md                   # (this file)
```

### Architecture (MVC-ish, frontend/backend separated)

```
┌────────────────┐        HTTPS/JSON (JWT in Authorization header)      ┌──────────────────┐
│  React Client  │  ───────────────────────────────────────────────►    │  Express API     │
│  (Vite, SPA)   │  ◄───────────────────────────────────────────────    │  (Controllers)   │
└────────────────┘                                                      └────────┬─────────┘
   Context API                                                                    │ Mongoose ODM
   (Auth, Cart)                                                                   ▼
                                                                          ┌──────────────────┐
                                                                          │    MongoDB       │
                                                                          │ Users/Books/      │
                                                                          │ Reviews/Orders    │
                                                                          └──────────────────┘
```

- **Routes** define URL + validation chains → delegate to **Controllers**.
- **Controllers** contain business logic and talk to **Models** (Mongoose schemas).
- **Middleware** (`auth.js`) handles JWT verification and role gating (`user` vs `admin`).
- A consistent response envelope (`{ success, message, data }` / `{ success, message, errors }`)
  is used everywhere via `utils/apiResponse.js`.
- The client never talks to MongoDB directly — everything goes through the API, and the API
  re-validates prices/stock server-side at checkout so the client cannot spoof order totals.

---

## 3. Environment variables

### Server (`server/.env` — copy from `server/.env.example`)

| Variable            | Description                                              | Example                                   |
|----------------------|-----------------------------------------------------------|--------------------------------------------|
| `NODE_ENV`           | `development` / `production` / `test`                     | `development`                              |
| `PORT`               | API port                                                   | `5000`                                     |
| `MONGO_URI`          | MongoDB connection string                                  | `mongodb://127.0.0.1:27017/bookstore`      |
| `JWT_SECRET`         | Secret used to sign JWTs — **use a long random string**    | `openssl rand -hex 32`                     |
| `JWT_EXPIRES_IN`     | Token lifetime                                              | `7d`                                        |
| `CLIENT_ORIGIN`      | Allowed CORS origin(s), comma-separated                     | `http://localhost:5173`                    |
| `SEED_ADMIN_EMAIL`   | Admin account created by the seed script                    | `admin@bookstore.com`                      |
| `SEED_ADMIN_PASSWORD`| Admin password created by the seed script                   | `Admin@12345`                              |

### Client (`client/.env` — copy from `client/.env.example`)

| Variable        | Description                          | Example                          |
|-----------------|----------------------------------------|-----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API             | `http://localhost:5000/api`      |

> ⚠️ Never commit real `.env` files. `.gitignore` already excludes them.

---

## 4. Running the project locally

### Prerequisites
- Node.js 18+ and npm 9+
- A MongoDB instance — either:
  - Local: `mongod` running on `127.0.0.1:27017`, or
  - Free tier on [MongoDB Atlas](https://www.mongodb.com/atlas)

### Step-by-step

```bash
# 1. Clone / unzip the project, then:
cd bookstore

# 2. Backend setup
cd server
cp .env.example .env        # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed                # creates admin user + 6 sample books
npm run dev                  # starts API on http://localhost:5000 (nodemon, auto-reload)

# 3. Frontend setup (in a second terminal)
cd ../client
cp .env.example .env         # defaults to http://localhost:5000/api
npm install
npm run dev                  # starts Vite dev server on http://localhost:5173
```

Visit **http://localhost:5173**. Log in as the seeded admin (`admin@bookstore.com` /
`Admin@12345` by default, or whatever you set in `server/.env`) to reach `/admin`, or
register a normal account to shop as a customer.

### Seeding / resetting data

```bash
cd server
npm run seed            # wipes Books/Reviews/Orders and inserts 6 sample books + admin user
npm run seed:destroy     # wipes Books/Reviews/Orders without reinserting (users kept)
```

### Building for production

```bash
# Backend: no build step needed, just run with NODE_ENV=production
cd server && NODE_ENV=production npm start

# Frontend: produces static assets in client/dist
cd client && npm run build
npm run preview   # optional local smoke-test of the production build
```

Deploy `client/dist` to any static host (Netlify, Vercel, S3+CloudFront, nginx). Deploy
`server/` to any Node host (Render, Railway, Fly.io, EC2). Point the client's
`VITE_API_URL` at your deployed API's public URL before building.

---

## 5. Database schema

### User
```js
{
  name: String,          // required, 2–60 chars
  email: String,         // required, unique, lowercased
  password: String,      // required, min 6 chars, bcrypt-hashed, never returned by default
  role: 'user' | 'admin', // default 'user'
  address: { street, city, state, zip, country },
  phone: String,
  timestamps: true
}
```

### Book
```js
{
  title: String,          // required
  author: String,         // required
  description: String,    // required
  genre: String,           // required, indexed
  price: Number,           // required, >= 0, indexed
  stock: Number,            // >= 0, default 0
  isbn: String,             // unique (sparse)
  coverImage: String,       // defaults to a placeholder
  publishedYear: Number,
  ratingAverage: Number,    // derived, 0–5, indexed desc
  ratingCount: Number,      // derived
  createdBy: ObjectId(User),
  timestamps: true
}
// Indexes: text index on {title, author, description, genre} for full-text search;
//          single-field indexes on genre, price, ratingAverage.
```

### Review
```js
{
  book: ObjectId(Book),   // required
  user: ObjectId(User),   // required
  rating: Number,          // required, 1–5
  comment: String,         // optional, max 1000 chars
  timestamps: true
}
// Unique compound index on {book, user} — one review per user per book.
// post-save / post-delete hooks recalculate the parent Book's ratingAverage/ratingCount.
```

### Order
```js
{
  user: ObjectId(User),
  items: [{ book: ObjectId(Book), title, price, quantity }], // price/title snapshotted at order time
  shippingAddress: { street, city, state, zip, country },
  paymentMethod: 'cod' | 'card_simulated' | 'upi_simulated',
  itemsPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  isPaid: Boolean,
  paidAt: Date,
  timestamps: true
}
// Indexes on {user, createdAt} and {status} for fast "my orders" / admin filtering.
```

**Admin roles** are not a separate collection — they're a `role` enum field on `User`
(`user` / `admin`), enforced by the `authorize('admin')` middleware on protected routes.
This keeps the schema simple while still giving clean role-based access control (RBAC).

---

## 6. API reference

Base URL: `http://localhost:5000/api`. All responses use the envelope:
```json
// success
{ "success": true, "message": "...", "data": { ... } }
// error
{ "success": false, "message": "...", "errors": [ "..." ] }
```

### Auth
| Method | Endpoint             | Access | Description                  |
|--------|-----------------------|--------|-------------------------------|
| POST   | `/auth/register`      | Public | Create a user account         |
| POST   | `/auth/login`         | Public | Log in, returns JWT           |
| GET    | `/auth/me`            | Private| Get current logged-in user    |

### Books
| Method | Endpoint                  | Access | Description                                  |
|--------|----------------------------|--------|------------------------------------------------|
| GET    | `/books`                   | Public | List/search/filter/paginate books               |
| GET    | `/books/genres/list`       | Public | Distinct list of genres                          |
| GET    | `/books/:id`               | Public | Get one book                                     |
| POST   | `/books`                   | Admin  | Create a book                                    |
| PUT    | `/books/:id`                | Admin  | Update a book                                     |
| DELETE | `/books/:id`                | Admin  | Delete a book                                     |

`GET /books` query params: `keyword, genre, author, minPrice, maxPrice, minRating, sort, page, limit`

### Reviews
| Method | Endpoint                        | Access  | Description                    |
|--------|----------------------------------|---------|----------------------------------|
| GET    | `/books/:bookId/reviews`          | Public  | List reviews for a book           |
| POST   | `/books/:bookId/reviews`          | Private | Add a review (one per user/book)  |
| DELETE | `/reviews/:id`                     | Private (owner) / Admin | Delete a review   |

### Users
| Method | Endpoint            | Access  | Description              |
|--------|-----------------------|---------|---------------------------|
| GET    | `/users/profile`       | Private | Get own profile            |
| PUT    | `/users/profile`        | Private | Update own profile          |
| GET    | `/users`                | Admin   | List all users              |

### Orders
| Method | Endpoint                | Access  | Description                       |
|--------|---------------------------|---------|-------------------------------------|
| POST   | `/orders`                  | Private | Place an order (simulated checkout) |
| GET    | `/orders/my`                | Private | List own orders                      |
| GET    | `/orders/:id`                | Private (owner) / Admin | Get one order       |
| GET    | `/orders`                    | Admin   | List all orders (filter by `status`) |
| PUT    | `/orders/:id/status`          | Admin   | Update order status                   |

### cURL smoke test

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass1234"}'

# Login (as seeded admin)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookstore.com","password":"Admin@12345"}'
# → copy the "token" field from the response for the requests below

TOKEN="paste-jwt-here"

# Browse books
curl "http://localhost:5000/api/books?genre=Fiction&sort=-ratingAverage"

# Create a book (admin only)
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"New Book","author":"Jane Doe","description":"A great read.","genre":"Fiction","price":299,"stock":10}'

# Place an order (as a logged-in user)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"book":"<bookId>","quantity":1}],"shippingAddress":{"street":"1 Main St","city":"Hyderabad","state":"TG","zip":"500001","country":"India"},"paymentMethod":"card_simulated"}'
```

A ready-to-import Postman collection can be recreated from this table, or you can hit
`GET /api/health` first to confirm the API is up.

---

## 7. Frontend notes

- **Routing:** React Router v6 (`BrowserRouter`), with a `ProtectedRoute` wrapper enforcing
  login (and optionally `role === 'admin'`) before rendering Checkout, Profile, or Admin pages.
- **State management:** React Context (`AuthContext`, `CartContext`) + hooks — no Redux needed
  at this scale. Cart state is persisted to `localStorage` so it survives refreshes; auth token
  is likewise persisted so sessions survive a reload.
- **Styling — plain CSS with custom properties:** chosen over Tailwind/CSS Modules for this
  project because (a) zero extra build tooling/config, (b) all design tokens (colors, radius,
  shadows) live in one `:root` block in `index.css`, easy to theme, and (c) it keeps the
  bundle small and dependency-free. Tailwind is a fine alternative if the team prefers utility
  classes; CSS Modules would be the pick if the app grows and per-component style isolation
  becomes important.
- **Accessibility:** semantic elements (`<nav>`, `<fieldset>/<legend>`, `<label for>`), visible
  focus outlines, `sr-only` text for icon-only controls, `aria-label`/`aria-expanded` on the
  mobile menu toggle, and alt text on all images.
- **Responsive design:** CSS grid with `auto-fill`/`minmax` for the book grid, a single
  breakpoint (`768px`) collapsing the nav into a toggled mobile menu and stacking multi-column
  layouts (book details, checkout, cart rows).

---

## 8. Admin capabilities

Admins are regular `User` documents with `role: 'admin'`. The seed script creates one
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). To promote another existing user to admin,
either update the field directly in MongoDB:

```js
db.users.updateOne({ email: "someone@example.com" }, { $set: { role: "admin" } })
```

or add a dedicated admin-promotion endpoint later (intentionally omitted from the MVP to keep
the attack surface small — see Roadmap).

**What admins can do (`/admin` dashboard, gated by `ProtectedRoute requireRole="admin"`):**
- **Books tab:** add new books (`AdminBookForm`), edit existing ones inline, delete books.
- **Orders tab:** view all customer orders and change their status
  (`pending → processing → shipped → delivered`, or `cancelled`).

All admin-only mutations are enforced server-side too (`authorize('admin')` middleware) — the
UI hiding a button is never the only protection.

---

## 9. Git workflow conventions

- **Branching:** `main` (always deployable) ← `develop` (integration) ← feature branches
  named `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) style —
  `feat: add book search filters`, `fix: correct order total calculation`,
  `docs: update README run instructions`, `refactor:`, `test:`, `chore:`.
- **Pull requests:** one logical change per PR; include a short description of what/why and
  screenshots for UI changes; require the build (`npm run build` on client, `node --check` /
  tests on server) to pass before merge.
- **`.gitignore`:** already excludes `node_modules/`, `.env`, `dist/`, and logs at both the
  root and per-package level — never commit secrets or build output.

---

## 10. MVP roadmap

### ✅ Phase 1 — MVP (this deliverable)
- Auth (register/login/JWT), role-based access (user/admin)
- Book catalog: browse, search (full-text), filter (genre/author/price/rating), sort, paginate
- Book details with reviews (create/read/delete) and auto-computed average rating
- Cart (localStorage-persisted) → simulated checkout → order creation with server-side
  price/stock re-validation
- User profile (view/edit, address) and order history
- Admin dashboard: book CRUD, order status management
- Consistent API error/response envelope, input validation, centralized error handling
- Responsive, accessible UI

### 🔜 Phase 2 — Enhancements
- **Real payments:** integrate Razorpay/Stripe instead of the simulated checkout
- **Recommendations:** "customers who bought this also bought…" using co-purchase data or a
  simple collaborative-filtering pass
- **Abandoned cart flows:** email/notification nudges for carts inactive > 24h
- **Wishlist / save for later**
- **Image uploads:** replace `coverImage` URL field with actual file upload (S3/Cloudinary)
- **Advanced admin analytics:** sales dashboard, low-stock alerts, top-rated/most-returned books
- **Pagination-aware infinite scroll** on Search/Home
- **Email verification** and password-reset flow
- **Rate limiting & refresh tokens** (currently a single long-lived JWT — fine for MVP, worth
  hardening before scaling to production traffic)
- **Automated test suite:** Jest + Supertest for API integration tests, React Testing Library
  for component tests (see `server/package.json` — `nodemon`/testing deps can be extended)

---

## 11. Known MVP-scope trade-offs (intentional, documented)

- Checkout is **simulated** — no real payment gateway is called; orders are marked `isPaid: true`
  immediately. This keeps the MVP self-contained and free of third-party API keys.
- Stock decrements on order creation are **not wrapped in a MongoDB transaction** (would require
  a replica-set-backed MongoDB). Fine for a single-instance MVP; flagged in Phase 2 for
  higher-concurrency scenarios.
- There is **no email service** wired up (verification, password reset, order confirmations)
  — endpoints are structured so this can be added without breaking existing contracts.
- JWTs are long-lived (`7d` default) with no refresh-token rotation, appropriate for an MVP but
  called out explicitly in the roadmap as a hardening item before production scaling.
