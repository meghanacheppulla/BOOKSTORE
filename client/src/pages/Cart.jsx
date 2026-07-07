import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { items, itemsPrice, shippingPrice, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="page empty-state-page">
        <p>Your cart is empty.</p>
        <Link to="/search" className="btn">Browse books</Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>Your cart</h1>
      <div className="cart-list">
        {items.map((item) => (
          <CartItem key={item.book} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Items</span>
          <span>₹{itemsPrice.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Shipping</span>
          <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
        <button className="btn" onClick={handleCheckout}>Proceed to checkout</button>
      </div>
    </div>
  );
}
