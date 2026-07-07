import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const Search = lazy(() => import('./pages/Search'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

export default function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Suspense fallback={<p className="page-loading">Loading BookStore...</p>}>
            <div key={location.pathname} className="page-fade-in">
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<p className="empty-state">Page not found.</p>} />
              </Routes>
            </div>
          </Suspense>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} BookStore. Built with the MERN stack.</p>
        </footer>
      </div>
    </ToastProvider>
  );
}
