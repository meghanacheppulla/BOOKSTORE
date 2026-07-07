import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, itemsPrice, shippingPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('card_simulated');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const payload = {
        items: items.map((i) => ({ book: i.book, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      navigate('/profile', { state: { orderPlaced: data.data.order._id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <p className="empty-state">Your cart is empty. Add books before checking out.</p>;
  }

  return (
    <div className="page checkout-page">
      <h1>Checkout</h1>
      <p className="hint">
        This is a simulated checkout for demo purposes — no real payment is processed.
      </p>

      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        <fieldset>
          <legend>Shipping address</legend>
          <label htmlFor="street">Street</label>
          <input id="street" name="street" value={address.street} onChange={handleChange} required />
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={address.city} onChange={handleChange} required />
          <label htmlFor="state">State</label>
          <input id="state" name="state" value={address.state} onChange={handleChange} required />
          <label htmlFor="zip">ZIP / PIN code</label>
          <input id="zip" name="zip" value={address.zip} onChange={handleChange} required />
          <label htmlFor="country">Country</label>
          <input id="country" name="country" value={address.country} onChange={handleChange} required />
        </fieldset>

        <fieldset>
          <legend>Payment method (simulated)</legend>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card_simulated"
              checked={paymentMethod === 'card_simulated'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            /> Credit / Debit card
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="upi_simulated"
              checked={paymentMethod === 'upi_simulated'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            /> UPI
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            /> Cash on delivery
          </label>
        </fieldset>

        <div className="cart-summary">
          <div className="cart-summary-row"><span>Items</span><span>₹{itemsPrice.toFixed(2)}</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span></div>
          <div className="cart-summary-row cart-summary-total"><span>Total</span><span>₹{totalPrice.toFixed(2)}</span></div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn" type="submit" disabled={placing}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
