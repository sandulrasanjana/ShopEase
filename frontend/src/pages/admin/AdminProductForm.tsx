import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Alert } from '../../components/Alert';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    price: '',
    stock: '',
    image: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      productService
        .getProductById(id)
        .then((prod) => {
          setFormData({
            name: prod.name,
            description: prod.description,
            category: prod.category,
            price: prod.price.toString(),
            stock: prod.stock.toString(),
            image: prod.image,
          });
        })
        .catch((err) => {
          console.error('Failed to load product', err);
          setError('Failed to fetch product details for editing');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Product description is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a valid number greater than 0';
    }

    const stockNum = Number(formData.stock);
    if (formData.stock === '' || isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      errors.stock = 'Stock must be a non-negative integer (0 or more)';
    }

    if (!formData.image.trim()) {
      errors.image = 'Product image URL is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        image: formData.image.trim(),
      };

      if (isEditMode && id) {
        await productService.updateProduct(id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product information..." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }} data-testid="admin-product-form-page">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-sm" data-testid="admin-product-back-btn">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {isEditMode
                ? 'Update catalog pricing, inventory count, or description'
                : 'Create a new product item available for shoppers in the catalog'}
            </p>
          </div>

          {error && <Alert type="danger" message={error} testId="admin-product-error" onClose={() => setError(null)} />}
          {success && <Alert type="success" message={success} testId="admin-product-success" />}

          <form onSubmit={handleSubmit} data-testid="admin-product-form">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-product-name">
                Product Name
              </label>
              <input
                id="admin-product-name"
                name="name"
                type="text"
                data-testid="admin-product-name"
                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Pro Wireless Headphones"
                value={formData.name}
                onChange={handleChange}
              />
              {fieldErrors.name && (
                <span className="form-error" data-testid="admin-product-name-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-product-category">
                Category
              </label>
              <select
                id="admin-product-category"
                name="category"
                data-testid="admin-product-category"
                className={`form-control ${fieldErrors.category ? 'is-invalid' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Electronics">Electronics</option>
                <option value="Laptops">Laptops</option>
                <option value="Phones">Phones</option>
                <option value="Accessories">Accessories</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-product-price">
                  Price ($)
                </label>
                <input
                  id="admin-product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  data-testid="admin-product-price"
                  className={`form-control ${fieldErrors.price ? 'is-invalid' : ''}`}
                  placeholder="299.99"
                  value={formData.price}
                  onChange={handleChange}
                />
                {fieldErrors.price && (
                  <span className="form-error" data-testid="admin-product-price-error">
                    {fieldErrors.price}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-product-stock">
                  Stock Units
                </label>
                <input
                  id="admin-product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  data-testid="admin-product-stock"
                  className={`form-control ${fieldErrors.stock ? 'is-invalid' : ''}`}
                  placeholder="15"
                  value={formData.stock}
                  onChange={handleChange}
                />
                {fieldErrors.stock && (
                  <span className="form-error" data-testid="admin-product-stock-error">
                    {fieldErrors.stock}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-product-image">
                Image URL
              </label>
              <input
                id="admin-product-image"
                name="image"
                type="url"
                data-testid="admin-product-image"
                className={`form-control ${fieldErrors.image ? 'is-invalid' : ''}`}
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleChange}
              />
              {fieldErrors.image && (
                <span className="form-error" data-testid="admin-product-image-error">
                  {fieldErrors.image}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-product-description">
                Description
              </label>
              <textarea
                id="admin-product-description"
                name="description"
                rows={4}
                data-testid="admin-product-description"
                className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
                placeholder="Detailed specifications, features, and warranty details..."
                value={formData.description}
                onChange={handleChange}
              />
              {fieldErrors.description && (
                <span className="form-error" data-testid="admin-product-description-error">
                  {fieldErrors.description}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block"
              style={{ marginTop: '1rem' }}
              data-testid="admin-product-submit"
            >
              <Save size={18} />
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

