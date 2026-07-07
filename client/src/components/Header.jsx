import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span>📚</span> BookStore
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Search</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `cart-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Admin</NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>{user?.name?.split(' ')[0] || 'Profile'}</NavLink>
              <button className="link-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
