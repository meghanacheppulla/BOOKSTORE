import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ReviewList from '../components/ReviewList';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const loadReviews = useCallback(() => {
    api.get(`/books/${id}/reviews`).then(({ data }) => setReviews(data.data.reviews));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/books/${id}`), api.get(`/books/${id}/reviews`)])
      .then(([bookRes, reviewsRes]) => {
        setBook(bookRes.data.data.book);
        setReviews(reviewsRes.data.data.reviews);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(book, quantity);
    addToast(`Added ${quantity} x "${book.title}" to cart!`, 'success');
  };

  if (loading) return <p className="page-loading">Loading book details…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!book) return <p className="empty-state">Book not found.</p>;

  return (
    <div className="page book-details">
      <button className="link-button" onClick={() => navigate(-1)}>&larr; Back</button>

      <div className="book-details-grid">
        <img src={book.imageUrl} alt={`Cover of ${book.title}`} className="book-details-cover" onError={(e) => { e.target.src = 'https://placehold.co/300x420/14110e/f3eae1?text=No+Cover' }} />
        <div>
          <h1>{book.title}</h1>
          <p className="book-details-author">by {book.author}</p>
          <div className="book-card-meta">
            <span className="badge">{book.genre}</span>
            {book.ratingCount > 0 ? (
              <span className="rating">★ {book.ratingAverage.toFixed(1)} ({book.ratingCount} reviews)</span>
            ) : (
              <span className="rating rating-empty">No reviews yet</span>
            )}
          </div>
          <p className="book-details-description">{book.description}</p>
          <p className="price price-lg">₹{book.price}</p>
          <p className={book.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {book.stock > 0 ? (
              <>
                <span className="stock-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#5cb377', borderRadius: '50%' }}></span>
                {book.stock} in stock
              </>
            ) : (
              <>
                <span className="stock-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#e25c5c', borderRadius: '50%' }}></span>
                Out of stock
              </>
            )}
          </p>

          {book.stock > 0 && (
            <div className="add-to-cart-row">
              <label htmlFor="qty" className="sr-only">Quantity</label>
              <input
                id="qty"
                type="number"
                min="1"
                max={book.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button className="btn" onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>

      <ReviewList bookId={id} reviews={reviews} onReviewChange={loadReviews} />
    </div>
  );
}
