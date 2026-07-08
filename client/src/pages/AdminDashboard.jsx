import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import AdminBookForm from '../components/AdminBookForm';
import BulkUploadCSV from '../components/BulkUploadCSV';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadBooks = useCallback(() => {
    api.get('/books', { params: { limit: 50 } }).then(({ data }) => setBooks(data.data.books));
  }, []);

  const loadOrders = useCallback(() => {
    api.get('/orders').then(({ data }) => setOrders(data.data.orders));
  }, []);

  useEffect(() => {
    loadBooks();
    loadOrders();
  }, [loadBooks, loadOrders]);

  const handleCreateOrUpdate = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      setShowForm(false);
      setEditingBook(null);
      loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book permanently?')) return;
    await api.delete(`/books/${id}`);
    loadBooks();
  };

  const handleStatusChange = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    loadOrders();
  };

  return (
    <div className="page admin-dashboard">
      <h1>Admin dashboard</h1>

      <div className="tabs">
        <button className={tab === 'books' ? 'tab active' : 'tab'} onClick={() => setTab('books')}>
          Books
        </button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>

      {tab === 'books' && (
        <section>
          <div className="section-header">
            <h2>Manage books</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className="btn btn-sm"
                onClick={() => {
                  setEditingBook(null);
                  setShowForm((s) => !s);
                }}
              >
                {showForm && !editingBook ? 'Close form' : 'Add new book'}
              </button>
              <BulkUploadCSV onUploadSuccess={loadBooks} />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          {showForm && (
            <AdminBookForm
              initialBook={editingBook}
              submitting={submitting}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
            />
          )}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.genre}</td>
                  <td>₹{b.price}</td>
                  <td>{b.stock}</td>
                  <td>
                    <button
                      className="link-button"
                      onClick={() => {
                        setEditingBook(b);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    {' · '}
                    <button className="link-button danger" onClick={() => handleDeleteBook(b._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No books available yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'orders' && (
        <section>
          <h2>Manage orders</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.user?.name} ({o.user?.email})</td>
                  <td>₹{o.totalPrice.toFixed(2)}</td>
                  <td>
                    <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No orders available yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
