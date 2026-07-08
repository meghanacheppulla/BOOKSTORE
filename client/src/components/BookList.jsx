import BookCard from './BookCard';

export default function BookList({ books, loading, emptyMessage = 'No books available yet' }) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="book-card skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="grid">
      {books.map((book, idx) => (
        <BookCard key={book._id} book={book} index={idx} />
      ))}
    </div>
  );
}
