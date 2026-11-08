import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter, PackageX } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter form states synced with URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Load categories once
  useEffect(() => {
    productService.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch products when query params change
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        limit: 100,
      };

      const qSearch = searchParams.get('search');
      if (qSearch) params.search = qSearch;

      const qCat = searchParams.get('category');
      if (qCat && qCat !== 'All') params.category = qCat;

      const qMin = searchParams.get('minPrice');
      if (qMin) params.minPrice = Number(qMin);

      const qMax = searchParams.get('maxPrice');
      if (qMax) params.maxPrice = Number(qMax);

      const qSort = searchParams.get('sort');
      if (qSort) params.sort = qSort;

      const res = await productService.getProducts(params);
      setProducts(res.products);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle filter submission
  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newParams: Record<string, string> = {};

    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (selectedCategory && selectedCategory !== 'All') newParams.category = selectedCategory;
    if (minPrice !== '') newParams.minPrice = minPrice;
    if (maxPrice !== '') newParams.maxPrice = maxPrice;
    if (sortBy && sortBy !== 'newest') newParams.sort = sortBy;

    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="container" data-testid="products-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Product Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore our complete collection of test products with realistic filtering, stock, and pricing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={applyFilters}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="product-search">
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="product-search"
                  type="text"
                  data-testid="product-search"
                  className="form-control"
                  placeholder="Search name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="product-category-filter">
                Category
              </label>
              <select
                id="product-category-filter"
                data-testid="product-category-filter"
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Price Range ($)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  data-testid="product-min-price"
                  className="form-control"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  data-testid="product-max-price"
                  className="form-control"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="product-sort">
                Sort By
              </label>
              <select
                id="product-sort"
                data-testid="product-sort"
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                data-testid="product-filter-submit"
              >
                <Search size={16} /> Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                data-testid="product-filter-reset"
                title="Reset all filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Header with Results Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong data-testid="products-count">{products.length}</strong> products
        </p>
      </div>

      {/* Products Display */}
      {loading ? (
        <LoadingSpinner message="Searching products..." />
      ) : products.length === 0 ? (
        <div className="empty-state" data-testid="products-empty-state">
          <PackageX className="empty-state-icon" />
          <h2 className="empty-state-title">No Products Found</h2>
          <p className="empty-state-text">
            No products matched your search or filter criteria. Try adjusting your search term or clearing filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-primary btn-sm"
            data-testid="empty-reset-btn"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="products-grid" data-testid="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

