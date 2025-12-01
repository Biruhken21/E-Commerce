import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../css/ProductCard.css';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProductCard({ product }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleContact = () => {
    if (!isAuthenticated()) {
      alert('Please login to contact us about this product');
      navigate('/login');
      return;
    }
    
    // Navigate to broker contact page with product data
    navigate('/broker-contact', { state: { product } });
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) {
      alert('Please login to save products');
      navigate('/login');
      return;
    }
    
    try {
      await productAPI.toggleFavorite(product._id);
      alert(`Toggled favorite for "${product.title}"!`);
    } catch (err) {
      alert('Failed to toggle favorite');
    }
  };

  // Debug: Log the product data to see what we're getting
  console.log('Product data:', product);
  console.log('Product images:', product.images);
  console.log('Product imageUrl:', product.imageUrl);

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={
          (product.images && product.images[0] && product.images[0].url) ||
          product.imageUrl ||
          'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000)
        } alt={product.title} 
        onError={(e) => {
          console.log('Image failed to load:', e.target.src);
          e.target.src = 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
        }}
        />
        <div className="condition-badge">{product.condition}</div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">${product.price}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <span className="seller">👤 Listed by: {product.seller?.name}</span>
          {/* Hide seller email - only show location */}
          {(product.location?.city || product.location?.state) && (
            <span className="location">📍 {product.location.city}{product.location.city && product.location.state ? ', ' : ''}{product.location.state}</span>
          )}
          <span className="broker-badge">🤝 Broker Protected Transaction</span>
        </div>
        <div className="product-actions">
          <button className="btn-primary" onClick={handleContact}>Contact Broker</button>
          <button className="btn-secondary" onClick={handleFavorite}>❤️ Save</button>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    condition: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    seller: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    location: PropTypes.shape({
      city: PropTypes.string,
      state: PropTypes.string,
    }),
  }).isRequired,
};

export default ProductCard;
