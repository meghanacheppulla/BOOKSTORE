import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ReviewList({ bookId, reviews, onReviewChange }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const alreadyReviewed = reviews.some((r) => r.user?._id === user?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/books/${bookId}/reviews`, { rating: Number(rating), comment });
      setComment('');
      setRating(5);
      onReviewChange();
      addToast('Review submitted successfully!', 'success');
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      onReviewChange();
      addToast('Review deleted successfully.', 'info');
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Could not delete review', 'error');
    }
  };

  return (
    <section className="reviews">
      <h3>Reviews ({reviews.length})</h3>

      {isAuthenticated && !alreadyReviewed && (
        <form className="review-form" onSubmit={handleSubmit}>
          <label htmlFor="rating">Your rating</label>
          <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
            ))}
          </select>
          <label htmlFor="comment">Your review</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of this book?"
            maxLength={1000}
            rows={3}
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-sm" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}

      {!isAuthenticated && <p className="hint">Log in to leave a review.</p>}

      {reviews.length === 0 ? (
        <p className="empty-state">No reviews yet. Be the first to review this book.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r._id} className="review-item">
              <div className="review-item-header">
                <strong>{r.user?.name || 'Anonymous'}</strong>
                <span className="rating">★ {r.rating}</span>
              </div>
              {r.comment && <p>{r.comment}</p>}
              {user && (user._id === r.user?._id || user.role === 'admin') && (
                <button className="link-button danger" onClick={() => handleDelete(r._id)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
