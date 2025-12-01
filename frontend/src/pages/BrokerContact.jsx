import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { brokerAPI } from '../services/api';
import '../css/BrokerContact.css';

function BrokerContact() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate broker fee
  const brokerFee = product ? (parseFloat(product.price) * 0.05).toFixed(2) : '0.00';
  const totalPrice = product ? (parseFloat(product.price) + parseFloat(brokerFee)).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert('Please login to contact our broker');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Debug: Log the product data
      console.log('🔍 Product data received:', product);
      console.log('🔍 Product ID:', product._id || product.id);
      console.log('🔍 Product ID type:', typeof (product._id || product.id));
      
      const contactData = {
        productId: product._id || product.id,
        ...contactForm
      };
      
      console.log('📤 Sending contact data:', contactData);
      
      // First, test if the API is reachable
      let serverAvailable = false;
      try {
        const testResponse = await fetch('http://localhost:5000/api/broker/test');
        if (testResponse.ok) {
          serverAvailable = true;
          console.log('✅ Server is reachable');
        }
      } catch (testError) {
        console.error('❌ Server test failed:', testError);
        console.log('⚠️ Server not available, using fallback mode');
      }
      
      if (serverAvailable) {
        // Try the real API
        const response = await brokerAPI.submitContact(contactData);
        alert(`Thank you for contacting us about "${product?.title}"!\n\nOur broker team will contact you within 24 hours.\n\n📞 Call: +1-555-BROKER\n📧 Email: broker@used.com`);
      } else {
        // Fallback mode - simulate success
        console.log('📝 Fallback mode: Simulating successful submission');
        alert(`Thank you for contacting us about "${product?.title}"!\n\nOur broker team will contact you within 24 hours.\n\n📞 Call: +1-555-BROKER\n📧 Email: broker@used.com\n\nNote: This is a demo mode. In production, your inquiry would be saved to our database.`);
      }
      
      setIsSubmitting(false);
      navigate('/');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An unexpected error occurred while submitting the form.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
      } else if (error.message.includes('Product not found')) {
        errorMessage = 'Product not found. Please try again or contact support.';
      } else if (error.message.includes('Missing required fields')) {
        errorMessage = 'Please fill in all required fields (name and email).';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  if (!product) {
    return (
      <div className="broker-contact-container">
        <h2>Product Not Found</h2>
        <p>Please go back and select a product to contact our broker.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="broker-contact-container">
      <div className="broker-header">
        <h1>🤝 Contact Our Broker</h1>
        <p>We'll help you connect with the seller and handle the transaction securely</p>
      </div>

      <div className="broker-content">
        <div className="product-summary">
          <h3>Product Details</h3>
          <div className="product-info-card">
            <img 
              src={
                (product.images && product.images[0] && product.images[0].url) ||
                product.imageUrl ||
                'https://picsum.photos/150/100?random=' + Math.floor(Math.random() * 1000)
              } 
              alt={product.title}
              className="product-thumbnail"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/150/100?random=' + Math.floor(Math.random() * 1000);
              }}
            />
            <div className="product-details">
              <h4>{product.title}</h4>
              <p className="price">${product.price}</p>
              <p className="condition">Condition: {product.condition}</p>
              <p className="location">📍 {product.location?.city}, {product.location?.state}</p>
            </div>
          </div>
          
          <div className="pricing-breakdown">
            <h4>Pricing Breakdown</h4>
            <div className="price-item">
              <span>Product Price:</span>
              <span>${product.price}</span>
            </div>
            <div className="price-item">
              <span>Broker Fee (5%):</span>
              <span>${brokerFee}</span>
            </div>
            <div className="price-item total">
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h3>Contact Information</h3>
          <form onSubmit={handleSubmit} className="broker-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={contactForm.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactForm.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={contactForm.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredContact">Preferred Contact Method</label>
              <select
                id="preferredContact"
                name="preferredContact"
                value={contactForm.preferredContact}
                onChange={handleInputChange}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any specific questions about this product?"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Contact Broker'}
            </button>
          </form>
        </div>

        <div className="broker-benefits">
          <h3>Why Use Our Broker Service?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <h4>Secure Transactions</h4>
              <p>We handle payments and ensure both parties are protected</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🤝</span>
              <h4>Verified Sellers</h4>
              <p>All sellers are verified and products are quality-checked</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📞</span>
              <h4>24/7 Support</h4>
              <p>Our team is available to help with any issues</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <h4>Fair Pricing</h4>
              <p>Transparent fees with no hidden costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrokerContact; 