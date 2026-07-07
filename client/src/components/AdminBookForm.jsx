import { useState, useEffect } from 'react';

const emptyForm = {
  title: '',
  author: '',
  description: '',
  genre: '',
  price: '',
  stock: '',
  isbn: '',
  coverImage: '',
  publishedYear: '',
};

export default function AdminBookForm({ initialBook, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialBook) {
      setForm({
        title: initialBook.title || '',
        author: initialBook.author || '',
        description: initialBook.description || '',
        genre: initialBook.genre || '',
        price: initialBook.price ?? '',
        stock: initialBook.stock ?? '',
        isbn: initialBook.isbn || '',
        coverImage: initialBook.coverImage || '',
        publishedYear: initialBook.publishedYear ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialBook]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
    });
  };

  return (
    <form className="admin-book-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="title">Title *</label>
        <input id="title" name="title" value={form.title} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label htmlFor="author">Author *</label>
        <input id="author" name="author" value={form.author} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="genre">Genre *</label>
          <input id="genre" name="genre" value={form.genre} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="price">Price (₹) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label htmlFor="publishedYear">Published year</label>
          <input
            id="publishedYear"
            name="publishedYear"
            type="number"
            value={form.publishedYear}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="isbn">ISBN</label>
          <input id="isbn" name="isbn" value={form.isbn} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label htmlFor="coverImage">Cover image URL</label>
          <input id="coverImage" name="coverImage" value={form.coverImage} onChange={handleChange} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving…' : initialBook ? 'Update book' : 'Create book'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
