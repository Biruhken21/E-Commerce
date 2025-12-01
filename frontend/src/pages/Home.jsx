import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../css/Home.css';

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Product posting form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    condition: 'Good',
    description: '',
    locationCity: '',
    locationState: '',
    sellerName: '',
    sellerEmail: '',
    category: 'Other',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProducts();
        setProducts(res.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Pre-fill seller information when form is shown and user is authenticated
  useEffect(() => {
    if (showPostForm && isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setNewProduct(prev => ({
        ...prev,
        sellerName: user.name || '',
        sellerEmail: user.email || ''
      }));
    }
  }, [showPostForm, isAuthenticated]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.sellerName || !newProduct.sellerEmail) return;
    let images = [];
    try {
      if (selectedImage) {
        const uploadRes = await uploadAPI.uploadSingle(selectedImage);
        images = [{
          url: uploadRes.data.url,
          alt: newProduct.title || 'Product image'
        }];
      }
      const productData = {
        title: newProduct.title,
        price: parseFloat(newProduct.price.replace(/[^0-9.]/g, '')),
        condition: newProduct.condition,
        description: newProduct.description,
        category: newProduct.category,
        seller: {
          name: newProduct.sellerName,
          email: newProduct.sellerEmail,
        },
        location: {
          city: newProduct.locationCity,
          state: newProduct.locationState,
        },
        images: images,
      };
      await productAPI.createProduct(productData);
      setShowPostForm(false);
      setNewProduct({
        title: '',
        price: '',
        condition: 'Good',
        description: '',
        locationCity: '',
        locationState: '',
        sellerName: '',
        sellerEmail: '',
        category: 'Other',
      });
      setSelectedImage(null);
      setImagePreview(null);
      // Refresh products
      const res = await productAPI.getProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError('Failed to post product');
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="header">
        <h1>Used.com - Buy & Sell Used Products</h1>
        <p>Find great deals on pre-owned items or sell your unused products</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      {/* Image Upload Section */}
      <div className="post-product-section">
        <button 
          className="post-btn"
          onClick={() => {
            if (!isAuthenticated()) {
              alert('Please login to post products');
              navigate('/login');
              return;
            }
            setShowPostForm(!showPostForm);
          }}
        >
          {showPostForm ? 'Cancel' : 'Post Your Product'}
        </button>
        {showPostForm && (
          <form className="product-form" onSubmit={handleSubmitProduct}>
            <h3>Post a New Product</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Product Title"
                value={newProduct.title}
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Price (e.g., $100)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <select
                value={newProduct.condition}
                onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              <input
                type="text"
                placeholder="Your Name"
                value={newProduct.sellerName}
                onChange={(e) => setNewProduct({...newProduct, sellerName: e.target.value})}
                required
                disabled={isAuthenticated()}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={newProduct.sellerEmail}
                onChange={(e) => setNewProduct({...newProduct, sellerEmail: e.target.value})}
                required
                disabled={isAuthenticated()}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Location City"
                value={newProduct.locationCity}
                onChange={(e) => setNewProduct({...newProduct, locationCity: e.target.value})}
              />
              <input
                type="text"
                placeholder="Location State"
                value={newProduct.locationState}
                onChange={(e) => setNewProduct({...newProduct, locationState: e.target.value})}
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Automotive">Automotive</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea
              placeholder="Product Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              rows="3"
            />
            {/* Image Upload Field */}
            <div className="image-upload-section">
              <label htmlFor="image-upload" className="upload-label">
                📷 Upload Product Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="image-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                  <button 
                    type="button" 
                    onClick={() => {setImagePreview(null); setSelectedImage(null);}}
                    className="remove-img-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="submit-btn">
              Post Product
            </button>
          </form>
        )}
      </div>
      <div className="products-grid">
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="no-results">{error}</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <p className="no-results">No products found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default Home;