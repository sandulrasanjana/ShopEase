import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Alert } from '../../components/Alert';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.products);
    } catch (err: any) {
      console.error('Failed to load products', err);
      setError('Failed to fetch product inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;

    try {
      setIsDeleting(true);
      await productService.deleteProduct(deleteProductTarget.id);
      setSuccessMsg(`Product "${deleteProductTarget.name}" deleted successfully.`);
      setDeleteProductTarget(null);
      await loadProducts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" data-testid="admin-products-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Product Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, update, and manage inventory levels for all products</p>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary" data-testid="admin-product-add-button">
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {successMsg && <Alert type="success" message={successMsg} testId="admin-product-alert-success" onClose={() => setSuccessMsg(null)} />}
      {error && <Alert type="danger" message={error} testId="admin-product-alert-error" onClose={() => setError(null)} />}

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', padding: '0.25rem' }}
            data-testid="admin-product-search-input"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading products inventory..." />
      ) : (
        <div className="card">
          <div className="card-header">
            <span>Inventory List</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          <div className="table-responsive">
            <table className="table" data-testid="admin-products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} data-testid="admin-product-row" data-product-id={prod.id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </td>
                    <td>#{prod.id}</td>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td>
                      <span className="user-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {prod.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${prod.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          prod.stock === 0
                            ? 'status-cancelled'
                            : prod.stock <= 5
                            ? 'status-pending'
                            : 'status-delivered'
                        }`}
                      >
                        {prod.stock === 0 ? 'Out of Stock (0)' : `${prod.stock} units`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link
                          to={`/admin/products/edit/${prod.id}`}
                          className="btn btn-outline btn-sm"
                          data-testid="admin-product-edit-button"
                          title="Edit Product"
                        >
                          <Edit2 size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteProductTarget(prod)}
                          className="btn btn-danger btn-sm"
                          data-testid="admin-product-delete-button"
                          title="Delete Product"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteProductTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProductTarget?.name}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Product'}
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteProductTarget(null)}
      />
    </div>
  );
};

