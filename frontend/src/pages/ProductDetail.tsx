import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertCircle, ShieldAlert, Star, MessageSquare, Send, Trash2, User } from 'lucide-react';
import { Product, Review, ReviewsResponse } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { StarRating } from '../components/StarRating';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const fetchProductAndReviews = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [prodData, revData] = await Promise.all([
        productService.getProductById(id),
        productService.getProductReviews(id).catch(() => null),
      ]);
      setProduct(prodData);
      setReviewsData(revData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError(err.response?.data?.message || 'Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductAndReviews();
  }, [fetchProductAndReviews]);

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    if (val < 1) return;
    if (val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/products/${product.id}`);
      return;
    }

    try {
      setIsAdding(true);
      setSuccessMsg(null);
      setError(null);
      await addToCart(product.id, quantity);
      setSuccessMsg(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !product) return;

    if (!newComment.trim()) {
      setReviewError('Please write a comment for your review');
      return;
    }

    if (newComment.trim().length < 3) {
      setReviewError('Review comment must be at least 3 characters long');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      setReviewSuccess(null);

      await productService.addReview(id, {
        rating: newRating,
        comment: newComment.trim(),
      });

      setReviewSuccess('Thank you! Your review has been submitted successfully.');
      setNewComment('');
      setNewRating(5);

      // Refresh reviews & product data
      const updatedReviews = await productService.getProductReviews(id);
      setReviewsData(updatedReviews);
      const updatedProduct = await productService.getProductById(id);
      setProduct(updatedProduct);
      setTimeout(() => setReviewSuccess(null), 4000);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!id) return;
    try {
      await productService.deleteReview(id, reviewId);
      const updatedReviews = await productService.getProductReviews(id);
      setReviewsData(updatedReviews);
      const updatedProduct = await productService.getProductById(id);
      setProduct(updatedProduct);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }} data-testid="product-not-found">
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The requested product could not be located in our inventory.'}
          </p>
          <Link to="/products" className="btn btn-primary" data-testid="back-to-products-btn">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const avgRating = reviewsData?.averageRating ?? product.rating ?? 0;
  const totalRev = reviewsData?.totalReviews ?? product.reviewCount ?? 0;
  const userHasReviewed = reviewsData?.reviews.some((r) => r.userId === user?.id);

  return (
    <div className="container" data-testid="product-details-container">
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" className="btn btn-secondary btn-sm" data-testid="back-button">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          padding: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Product Image */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', maxHeight: '460px', objectFit: 'contain' }}
            data-testid="product-details-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Product Information */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
            data-testid="product-details-category"
          >
            {product.category}
          </span>

          <h1
            style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.25 }}
            data-testid="product-details-title"
          >
            {product.name}
          </h1>

          {/* Star Rating Overview Snippet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }} data-testid="product-details-rating">
            <StarRating rating={avgRating} size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {avgRating > 0 ? avgRating.toFixed(1) : 'No reviews yet'}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ({totalRev} {totalRev === 1 ? 'customer review' : 'customer reviews'})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span
              style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-dark)' }}
              data-testid="product-details-price"
            >
              ${product.price.toFixed(2)}
            </span>
            <span
              className={`status-badge ${isOutOfStock ? 'status-cancelled' : 'status-delivered'}`}
              data-testid="product-details-stock"
            >
              {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Product Description</h3>
            <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }} data-testid="product-details-description">
              {product.description}
            </p>
          </div>

          {successMsg && <Alert type="success" message={successMsg} testId="product-add-success" />}
          {error && <Alert type="danger" message={error} testId="product-details-error" onClose={() => setError(null)} />}

          {/* Add to Cart Actions */}
          {!isAdmin ? (
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={isOutOfStock || quantity <= 1}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '8px 0 0 8px', border: 'none', padding: '0.5rem 0.85rem' }}
                    data-testid="product-quantity-decrease"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                    disabled={isOutOfStock}
                    style={{ width: '50px', textAlign: 'center', border: 'none', fontWeight: 600, outline: 'none' }}
                    data-testid="product-quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '0 8px 8px 0', border: 'none', padding: '0.5rem 0.85rem' }}
                    data-testid="product-quantity-increase"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="btn btn-primary btn-lg btn-block"
                data-testid="add-to-cart"
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? 'Currently Unavailable' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          ) : (
            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <p style={{ color: '#92400e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} />
                Logged in as Admin. Shopping cart is reserved for Customer roles.
              </p>
              <Link to={`/admin/products`} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                Manage in Admin Catalog
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }} data-testid="reviews-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <MessageSquare size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Reviews & Ratings</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Rating Summary Card */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-dark)', lineHeight: 1 }} data-testid="reviews-average-score">
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </div>
            <div style={{ margin: '0.5rem 0' }}>
              <StarRating rating={avgRating} size={20} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} data-testid="reviews-total-count">
              Based on {totalRev} {totalRev === 1 ? 'verified review' : 'verified reviews'}
            </p>

            {/* Rating breakdown bars */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData?.ratingDistribution[stars] || 0;
                const percentage = totalRev > 0 ? (count / totalRev) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '45px', color: 'var(--text-muted)' }}>{stars} stars</span>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ width: '25px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a Review Form */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Share Your Experience</h3>

            {reviewSuccess && <Alert type="success" message={reviewSuccess} testId="review-success" onClose={() => setReviewSuccess(null)} />}
            {reviewError && <Alert type="danger" message={reviewError} testId="review-error" onClose={() => setReviewError(null)} />}

            {isAuthenticated ? (
              userHasReviewed ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '8px', color: '#166534' }}>
                  <p style={{ fontWeight: 600 }}>You have already submitted a review for this product.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Thank you for your valuable feedback!</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} data-testid="review-form">
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Your Rating</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid="review-rating-select">
                      <StarRating
                        rating={newRating}
                        size={24}
                        interactive={true}
                        onChange={(val) => setNewRating(val)}
                        testId="review-star-picker"
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#b45309' }}>
                        {newRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="review-comment-input">
                      Review Comment
                    </label>
                    <textarea
                      id="review-comment-input"
                      rows={3}
                      className="form-control"
                      placeholder="What did you like or dislike about this product? (min 3 chars)"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      data-testid="review-comment-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="btn btn-primary btn-sm"
                    data-testid="review-submit-btn"
                  >
                    <Send size={14} />
                    <span>{reviewSubmitting ? 'Submitting Review...' : 'Post Review'}</span>
                  </button>
                </form>
              )
            ) : (
              <div style={{ background: '#f8fafc', border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Only registered customers can leave reviews. Sign in to share your thoughts.
                </p>
                <Link to={`/login?redirect=/products/${product.id}`} className="btn btn-primary btn-sm" data-testid="review-login-btn">
                  Sign In to Write a Review
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Customer Feedback</h3>

          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid="reviews-list">
              {reviewsData.reviews.map((rev: Review) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: '#ffffff',
                  }}
                  data-testid="review-card"
                  data-review-id={rev.id}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <strong style={{ fontSize: '0.95rem' }} data-testid="review-user">{rev.userName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} data-testid="review-date">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div data-testid="review-rating">
                        <StarRating rating={rev.rating} size={14} />
                      </div>
                    </div>

                    {(user?.id === rev.userId || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="btn btn-sm"
                        style={{ color: 'var(--danger)', background: 'transparent', border: 'none', padding: '0.25rem' }}
                        data-testid="review-delete-btn"
                        title="Delete review"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '0.5rem' }} data-testid="review-comment">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '8px' }} data-testid="reviews-empty">
              No reviews yet for this product. Be the first to share your review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
