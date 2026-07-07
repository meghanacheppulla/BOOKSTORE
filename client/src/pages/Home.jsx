import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BookList from '../components/BookList';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/books', { params: { sort: '-createdAt', limit: 8 } })
      .then(({ data }) => {
        if (!cancelled) setBooks(data.data.books);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <h1>Find your next great read</h1>
        <p>Browse thousands of titles across every genre, at prices that make sense.</p>
        <Link to="/search" className="btn">Browse all books &rarr;</Link>
        
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Happy Readers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Genres Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Free</div>
            <div className="stat-label">Shipping over ₹500</div>
          </div>
        </div>
      </section>

      <section>
        <h2>Newest arrivals</h2>
        {error && <p className="form-error">{error}</p>}
        <BookList books={books} loading={loading} />
      </section>
    </div>
  );
}
