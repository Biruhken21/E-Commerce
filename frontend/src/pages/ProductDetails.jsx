import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/ProductDetails.css';

function ProductDetails() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.email !== 'admin@used.com') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    // Get product data from location state
    if (location.state && location.state.product) {
      setProduct(location.state.product);
      setLoading(false);
    } else {
      setError('No product data provided');
      setLoading(false);
    }
  }, [isAuthenticated, navigate, location.state]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackToInquiries = () => {
    navigate('/admin', { state: { activeTab: 'inquiries' } });
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="error-message">
          <h2>⚠️ Error Loading Product</h2>
          <p>{error || 'Product not found'}</p>
          <button onClick={handleBackToInquiries} className="btn-back">
            ← Back to Inquiries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="product-header">
        <button onClick={handleBackToInquiries} className="btn-back">
          ← Back to Inquiries
        </button>
        <h1>📦 Product Details</h1>
      </div>

      <div className="product-container">
        <div className="product-images-section">
          <div className="main-image">
            <img 
              src={
                (product.images && product.images[0] && product.images[0].url) ||
                product.imageUrl ||
                'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000)
              }
              alt={product.title}
              onError={(e) => {
                e.target.src = 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000);
              }}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="image-gallery">
              <h3>Additional Images</h3>
              <div className="gallery-grid">
                {product.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image.url}
                    alt={`${product.title} - Image ${index + 2}`}
                    className="gallery-thumbnail"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/100/100?random=' + Math.floor(Math.random() * 1000);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="product-info-section">
          <div className="product-basic-info">
            <h2>{product.title}</h2>
            <div className="price-section">
              <span className="price">{formatCurrency(product.price)}</span>
              <span className="condition-badge">{product.condition}</span>
            </div>
            <p className="description">{product.description}</p>
          </div>

          <div className="product-details-grid">
            <div className="detail-card">
              <h3>📋 Product Information</h3>
              <div className="detail-item">
                <strong>Product ID:</strong> {product._id || product.id}
              </div>
              <div className="detail-item">
                <strong>Category:</strong> {product.category || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Condition:</strong> {product.condition}
              </div>
              <div className="detail-item">
                <strong>Brand:</strong> {product.brand || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Model:</strong> {product.model || 'Not specified'}
              </div>
            </div>

            <div className="detail-card">
              <h3>📍 Location</h3>
              <div className="detail-item">
                <strong>City:</strong> {product.location?.city || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>State:</strong> {product.location?.state || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Country:</strong> {product.location?.country || 'Not specified'}
              </div>
            </div>

            <div className="detail-card">
              <h3>👤 Seller Information</h3>
              <div className="detail-item">
                <strong>Name:</strong> {product.seller?.name || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {product.seller?.email || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Phone:</strong> {product.seller?.phone || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Member Since:</strong> {product.seller?.createdAt ? formatDate(product.seller.createdAt) : 'Not specified'}
              </div>
            </div>

            <div className="detail-card">
              <h3>📅 Listing Information</h3>
              <div className="detail-item">
                <strong>Listed On:</strong> {product.createdAt ? formatDate(product.createdAt) : 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Last Updated:</strong> {product.updatedAt ? formatDate(product.updatedAt) : 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${product.status || 'active'}`}>
                  {product.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="specifications-section">
              <h3>🔧 Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleBackToInquiries}>
              📋 View Related Inquiries
            </button>
            <button className="btn-secondary">
              📧 Contact Seller
            </button>
            <button className="btn-secondary">
              📞 Call Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails; 