import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import BookList from '../components/BookList';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    genre: searchParams.get('genre') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);

  // Debounce effect for keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.keyword]);

  useEffect(() => {
    api.get('/books/genres/list').then(({ data }) => setGenres(data.data.genres));
  }, []);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const queryParams = { ...filters, keyword: debouncedKeyword };
    const params = Object.fromEntries(
      Object.entries(queryParams).filter(([, v]) => v !== '' && v !== null)
    );
    setSearchParams(params);
    api
      .get('/books', { params })
      .then(({ data }) => {
        setBooks(data.data.books);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.genre, filters.minPrice, filters.maxPrice, filters.minRating, filters.sort, filters.page, debouncedKeyword]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((f) => ({ ...f, page: newPage }));
  };

  return (
    <div className="page">
      <h1>Search books</h1>

      <div className="filters">
        <input
          type="search"
          name="keyword"
          placeholder="Search by title, author, description…"
          value={filters.keyword}
          onChange={handleFilterChange}
        />
        <select name="genre" value={filters.genre} onChange={handleFilterChange}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          type="number"
          name="minPrice"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
          <option value="">Any rating</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
        </select>
        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="-createdAt">Newest</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="-ratingAverage">Top rated</option>
        </select>
      </div>

      <BookList books={books} loading={loading} emptyMessage="No books match your filters." />

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            &larr; Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
