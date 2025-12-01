import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { brokerAPI } from '../services/api';
import '../css/AdminDashboard.css';

function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // For demo purposes, let's assume user with email 'admin@used.com' is admin
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.email !== 'admin@used.com') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await brokerAPI.getStats();
      setStats(statsResponse.stats);
      
      // Load inquiries
      const inquiriesResponse = await brokerAPI.getInquiries();
      setInquiries(inquiriesResponse.inquiries);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryAction = async (inquiryId, action) => {
    try {
      // Here you would typically make an API call to update the inquiry status
      console.log(`Action ${action} on inquiry ${inquiryId}`);
      
      // For demo, just update the local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: action === 'approve' ? 'approved' : 'rejected' }
          : inquiry
      ));
      
      alert(`Inquiry ${action}d successfully!`);
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Failed to update inquiry');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    // Filter by status
    const statusMatch = filter === 'all' || inquiry.status === filter;
    
    // Filter by search term (product ID, product title, or buyer name)
    const searchMatch = !searchTerm || 
      (inquiry.productId && typeof inquiry.productId === 'object' && inquiry.productId._id && inquiry.productId._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.productId && typeof inquiry.productId === 'string' && inquiry.productId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.productTitle && inquiry.productTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.buyer?.name && inquiry.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  // Debug logging
  console.log('Active tab:', activeTab);
  console.log('Inquiries:', inquiries);
  console.log('Filtered inquiries:', filteredInquiries);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🤝 Broker Admin Dashboard</h1>
        <p>Manage inquiries, track revenue, and monitor transactions</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          📋 Inquiries ({inquiries.length})
        </button>
        <button 
          className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          💰 Revenue
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('inquiries')} style={{cursor: 'pointer'}}>
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>Total Inquiries</h3>
                  <p className="stat-number">{stats?.totalInquiries || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <p className="stat-number">{stats?.pendingInquiries || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p className="stat-number">{stats?.completedTransactions || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {inquiries.length > 0 ? (
                  <>
                    {inquiries.slice(0, 5).map(inquiry => {
                      if (!inquiry || !inquiry._id) return null;
                      
                      return (
                        <div key={inquiry._id} className="activity-item">
                          <div className="activity-icon">📧</div>
                          <div className="activity-content">
                            <p><strong>{inquiry.buyer?.name || 'Unknown Buyer'}</strong> inquired about <strong>{inquiry.productTitle || 'Unknown Product'}</strong></p>
                            <small>{inquiry.createdAt ? formatDate(inquiry.createdAt) : 'N/A'}</small>
                          </div>
                          <div className="activity-status">
                            <span className={`status-badge ${inquiry.status || 'pending'}`}>
                              {inquiry.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                                         {inquiries.length > 5 && (
                       <div className="view-all-link">
                         <button onClick={() => setActiveTab('inquiries')} className="view-all-btn">
                           View All Inquiries ({inquiries.length})
                         </button>
                       </div>
                     )}
                  </>
                ) : (
                  <div className="no-activity">
                    <p>No inquiries yet. When users contact the broker, they'll appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="inquiries-section">
            <div className="inquiries-controls">
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search by Product ID, Product Title, or Buyer Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="clear-search-btn"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="filters">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status ({inquiries.length})</option>
                  <option value="pending">Pending ({inquiries.filter(i => i.status === 'pending').length})</option>
                  <option value="approved">Approved ({inquiries.filter(i => i.status === 'approved').length})</option>
                  <option value="rejected">Rejected ({inquiries.filter(i => i.status === 'rejected').length})</option>
                  <option value="completed">Completed ({inquiries.filter(i => i.status === 'completed').length})</option>
                </select>
              </div>
              
              <button onClick={loadDashboardData} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>

            <div className="inquiries-content">
              {!Array.isArray(filteredInquiries) ? (
                <div className="no-inquiries">
                  <h3>⚠️ Error Loading Inquiries</h3>
                  <p>There was an error loading the inquiries data.</p>
                  <button onClick={loadDashboardData} className="view-all-btn">
                    Retry Loading
                  </button>
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="no-inquiries">
                  <h3>📭 No Inquiries Found</h3>
                  <p>There are no inquiries matching your current filter.</p>
                  {filter !== 'all' && (
                    <button onClick={() => setFilter('all')} className="view-all-btn">
                      View All Inquiries
                    </button>
                  )}
                </div>
              ) : (
                <div className="inquiries-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Contact</th>
                        <th>Price</th>
                        <th>Broker Fee</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.map(inquiry => {
                        // Add safety checks for inquiry data
                        if (!inquiry || !inquiry._id) {
                          console.warn('Invalid inquiry data:', inquiry);
                          return null;
                        }
                        
                        return (
                          <tr key={inquiry._id}>
                            <td>
                              <div className="inquiry-date">
                                {inquiry.createdAt ? formatDate(inquiry.createdAt) : 'N/A'}
                              </div>
                            </td>
                            <td>
                              <div className="product-image-cell">
                                <img 
                                  src={
                                    (inquiry.productId && typeof inquiry.productId === 'object' && inquiry.productId.images && inquiry.productId.images[0] && inquiry.productId.images[0].url) ||
                                    (inquiry.productId && typeof inquiry.productId === 'object' && inquiry.productId.imageUrl) ||
                                    (inquiry.productImages && inquiry.productImages[0] && inquiry.productImages[0].url) ||
                                    (inquiry.productImageUrl) ||
                                    'https://picsum.photos/60/60?random=' + Math.floor(Math.random() * 1000)
                                  }
                                  alt={inquiry.productTitle || 'Product'}
                                  className="product-thumbnail clickable"
                                  onClick={() => navigate('/product-details', { 
                                    state: { 
                                      product: inquiry.productId && typeof inquiry.productId === 'object' ? inquiry.productId : {
                                        _id: inquiry.productId,
                                        title: inquiry.productTitle,
                                        price: inquiry.productPrice,
                                        images: inquiry.productImages,
                                        imageUrl: inquiry.productImageUrl
                                      }
                                    } 
                                  })}
                                  onError={(e) => {
                                    e.target.src = 'https://picsum.photos/60/60?random=' + Math.floor(Math.random() * 1000);
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="product-info">
                                <strong 
                                  className="clickable-product-title"
                                  onClick={() => navigate('/product-details', { 
                                    state: { 
                                      product: inquiry.productId && typeof inquiry.productId === 'object' ? inquiry.productId : {
                                        _id: inquiry.productId,
                                        title: inquiry.productTitle,
                                        price: inquiry.productPrice,
                                        images: inquiry.productImages,
                                        imageUrl: inquiry.productImageUrl
                                      }
                                    } 
                                  })}
                                >
                                  {inquiry.productTitle || 'Unknown Product'}
                                </strong>
                                <small>ID: {typeof inquiry.productId === 'object' ? inquiry.productId._id || 'N/A' : inquiry.productId || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              <div className="buyer-info">
                                <strong>{inquiry.buyer?.name || 'Unknown Buyer'}</strong>
                                <small>{inquiry.buyer?.preferredContact || 'N/A'}</small>
                              </div>
                            </td>
                            <td>
                              <div className="contact-info">
                                <div>{inquiry.buyer?.email || 'N/A'}</div>
                                {inquiry.buyer?.phone && <div>{inquiry.buyer.phone}</div>}
                              </div>
                            </td>
                            <td>{inquiry.productPrice ? formatCurrency(inquiry.productPrice) : 'N/A'}</td>
                            <td>{inquiry.brokerFee ? formatCurrency(inquiry.brokerFee) : 'N/A'}</td>
                            <td><strong>{inquiry.totalPrice ? formatCurrency(inquiry.totalPrice) : 'N/A'}</strong></td>
                            <td>
                              <span className={`status-badge ${inquiry.status || 'pending'}`}>
                                {inquiry.status || 'pending'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-view"
                                  onClick={() => setSelectedInquiry(inquiry)}
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                
                                {(inquiry.status === 'pending' || !inquiry.status) && (
                                  <>
                                    <button 
                                      className="btn-approve"
                                      onClick={() => handleInquiryAction(inquiry._id, 'approve')}
                                      title="Approve"
                                    >
                                      ✅
                                    </button>
                                    <button 
                                      className="btn-reject"
                                      onClick={() => handleInquiryAction(inquiry._id, 'reject')}
                                      title="Reject"
                                    >
                                      ❌
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="revenue-section">
            <div className="revenue-overview">
              <div className="revenue-card">
                <h3>Total Revenue</h3>
                <p className="revenue-amount">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <small>All time</small>
              </div>
              
              <div className="revenue-card">
                <h3>This Month</h3>
                <p className="revenue-amount">{formatCurrency(stats?.thisMonth?.revenue || 0)}</p>
                <small>{stats?.thisMonth?.inquiries || 0} inquiries</small>
              </div>
              
              <div className="revenue-card">
                <h3>Average Commission</h3>
                <p className="revenue-amount">$25.50</p>
                <small>Per transaction</small>
              </div>
            </div>

            <div className="revenue-chart">
              <h3>Revenue Trend</h3>
              <div className="chart-placeholder">
                📈 Revenue chart would be displayed here
                <br />
                <small>Integration with Chart.js or similar library</small>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h3>Broker Settings</h3>
            
            <div className="setting-group">
              <label>Broker Commission Rate</label>
              <div className="setting-input">
                <input type="number" defaultValue="5" min="1" max="20" />
                <span>%</span>
              </div>
            </div>
            
            <div className="setting-group">
              <label>Contact Information</label>
              <input type="text" defaultValue="+1-555-BROKER" placeholder="Phone Number" />
              <input type="email" defaultValue="broker@used.com" placeholder="Email Address" />
            </div>
            
            <div className="setting-group">
              <label>Auto-Response Message</label>
              <textarea 
                rows="4" 
                placeholder="Default message sent to buyers..."
                defaultValue="Thank you for your inquiry! Our broker team will contact you within 24 hours."
              />
            </div>
            
            <button className="btn-save">💾 Save Settings</button>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inquiry Details</h3>
              <button onClick={() => setSelectedInquiry(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="inquiry-detail">
                <h4>📦 Product Information</h4>
                <div className="product-image-modal">
                  <img 
                    src={
                      (selectedInquiry.productId && typeof selectedInquiry.productId === 'object' && selectedInquiry.productId.images && selectedInquiry.productId.images[0] && selectedInquiry.productId.images[0].url) ||
                      (selectedInquiry.productId && typeof selectedInquiry.productId === 'object' && selectedInquiry.productId.imageUrl) ||
                      (selectedInquiry.productImages && selectedInquiry.productImages[0] && selectedInquiry.productImages[0].url) ||
                      (selectedInquiry.productImageUrl) ||
                      'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000)
                    }
                    alt={selectedInquiry.productTitle || 'Product'}
                    className="product-image-large"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000);
                    }}
                  />
                </div>
                <p><strong>Title:</strong> {selectedInquiry.productTitle}</p>
                <p><strong>Product ID:</strong> {selectedInquiry.productId}</p>
                <p><strong>Price:</strong> {formatCurrency(selectedInquiry.productPrice)}</p>
                
                <h4>👤 Buyer Information</h4>
                <p><strong>Name:</strong> {selectedInquiry.buyer.name}</p>
                <p><strong>Email:</strong> {selectedInquiry.buyer.email}</p>
                <p><strong>Phone:</strong> {selectedInquiry.buyer.phone || 'Not provided'}</p>
                <p><strong>Preferred Contact:</strong> {selectedInquiry.buyer.preferredContact}</p>
                
                {selectedInquiry.message && (
                  <>
                    <h4>💬 Message</h4>
                    <p>{selectedInquiry.message}</p>
                  </>
                )}
                
                <h4>💰 Financial Details</h4>
                <p><strong>Product Price:</strong> {formatCurrency(selectedInquiry.productPrice)}</p>
                <p><strong>Broker Fee (5%):</strong> {formatCurrency(selectedInquiry.brokerFee)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(selectedInquiry.totalPrice)}</p>
                
                <h4>📅 Timeline</h4>
                <p><strong>Submitted:</strong> {formatDate(selectedInquiry.createdAt)}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedInquiry.status}`}>
                    {selectedInquiry.status}
                  </span>
                </p>
                {selectedInquiry.updatedAt && (
                  <p><strong>Last Updated:</strong> {formatDate(selectedInquiry.updatedAt)}</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setSelectedInquiry(null)}>Close</button>
              <button className="btn-primary">📧 Contact Buyer</button>
              <button className="btn-secondary">📞 Call Buyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 