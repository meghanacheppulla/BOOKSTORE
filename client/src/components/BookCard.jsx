import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function BookCard({ book, index = 0 }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    addToast(`"${book.title}" added to cart!`, 'success');
  };

  return (
    <article className="book-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <Link to={`/books/${book._id}`} className="book-card-image-link">
        <img src={book.coverImage} alt={`Cover of ${book.title}`} loading="lazy" />
      </Link>
      <div className="book-card-body">
        <Link to={`/books/${book._id}`} className="book-card-title">
          {book.title}
        </Link>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-meta">
          <span className="badge">{book.genre}</span>
          {book.ratingCount > 0 ? (
            <span className="rating" aria-label={`Rated ${book.ratingAverage} out of 5`}>
              ★ {book.ratingAverage.toFixed(1)} ({book.ratingCount})
            </span>
          ) : (
            <span className="rating rating-empty">No ratings yet</span>
          )}
        </div>
        <div className="book-card-footer">
          <span className="price">₹{book.price}</span>
          <button
            className="btn btn-sm"
            disabled={book.stock === 0}
            onClick={handleAddToCart}
          >
            {book.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
