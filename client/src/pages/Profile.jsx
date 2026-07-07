import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
  });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(location.state?.orderPlaced ? 'Order placed successfully!' : '');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.data.orders));
    if (location.state?.orderPlaced) {
      addToast('Order placed successfully! Thank you.', 'success');
    }
  }, [location.state, addToast]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/users/profile', {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zip: form.zip },
      });
      setUser(data.data.user);
      localStorage.setItem('bookstore_user', JSON.stringify(data.data.user));
      setMessage('Profile updated.');
      addToast('Profile changes saved!', 'success');
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page profile-page">
      <h1>My profile</h1>

      <form onSubmit={handleSave} className="auth-form">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
        <label htmlFor="email">Email</label>
        <input id="email" value={user?.email || ''} disabled />
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        <label htmlFor="street">Street</label>
        <input id="street" name="street" value={form.street} onChange={handleChange} />
        <label htmlFor="city">City</label>
        <input id="city" name="city" value={form.city} onChange={handleChange} />
        <label htmlFor="state">State</label>
        <input id="state" name="state" value={form.state} onChange={handleChange} />
        <label htmlFor="zip">ZIP / PIN code</label>
        <input id="zip" name="zip" value={form.zip} onChange={handleChange} />
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <section>
        <h2>My orders</h2>
        {orders.length === 0 ? (
          <p className="empty-state">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="order-list">
            {orders.map((o, idx) => (
              <li key={o._id} className="order-item" style={{ animationDelay: `${idx * 0.08}s` }}>
                <div className="order-item-header">
                  <span>Order #{o._id.slice(-6).toUpperCase()}</span>
                  <span className={`order-status status-${o.status}`}>{o.status}</span>
                </div>
                <p>{o.items.length} item(s) · ₹{o.totalPrice.toFixed(2)}</p>
                <p className="hint">{new Date(o.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
