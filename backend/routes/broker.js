const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BrokerInquiry = require('../models/BrokerInquiry');
const Product = require('../models/Product');
const mongoose = require('mongoose'); // Added missing import for mongoose

// Test endpoint to check database connection and models
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing broker API...');
    
    // Test Product model
    const productCount = await Product.countDocuments();
    console.log('📦 Product count:', productCount);
    
    // Test BrokerInquiry model
    const inquiryCount = await BrokerInquiry.countDocuments();
    console.log('📋 Inquiry count:', inquiryCount);
    
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log('🗄️ Database state:', dbStates[dbState]);
    
    res.json({
      success: true,
      message: 'Broker API test successful',
      data: {
        productCount,
        inquiryCount,
        databaseState: dbStates[dbState],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Broker API test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Broker API test failed',
      error: error.message
    });
  }
});

// Test endpoint to list products
router.get('/products', async (req, res) => {
  try {
    console.log('📦 Listing all products...');
    
    const products = await Product.find().select('_id title price');
    console.log('📦 Found products:', products);
    
    res.json({
      success: true,
      message: 'Products listed successfully',
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('❌ Error listing products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list products',
      error: error.message
    });
  }
});

// Broker contact form submission
router.post('/contact', async (req, res) => {
  try {
    console.log('🔔 Broker contact request received:', req.body);
    
    const { productId, name, email, phone, message, preferredContact } = req.body;
    
    // Validate required fields
    if (!productId || !name || !email) {
      console.log('❌ Missing required fields:', { productId, name, email });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: productId, name, email' 
      });
    }
    
    console.log('🔍 Looking for product with ID:', productId);
    console.log('🔍 Product ID type:', typeof productId);
    
    // Validate product ID format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid product ID format:', productId);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    
    // Get product details to calculate broker fee
    let product;
    try {
      product = await Product.findById(productId);
      console.log('🔍 Product found:', product ? 'Yes' : 'No');
    } catch (dbError) {
      console.error('❌ Database error finding product:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while finding product' 
      });
    }
    
    if (!product) {
      console.log('❌ Product not found for ID:', productId);
      
      // List some available products for debugging
      try {
        const availableProducts = await Product.find().limit(5).select('_id title');
        console.log('📦 Available products:', availableProducts);
      } catch (listError) {
        console.error('❌ Error listing products:', listError);
      }
      
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    console.log('💰 Product price:', product.price);
    console.log('💰 Product title:', product.title);

    // Calculate broker fee (5% of product price)
    const brokerFee = parseFloat((product.price * 0.05).toFixed(2));
    const totalPrice = parseFloat((product.price + brokerFee).toFixed(2));
    
    console.log('💰 Calculated fees - Broker fee:', brokerFee, 'Total:', totalPrice);

    // Create new inquiry
    let inquiry;
    console.log('💾 Saving inquiry to database...');
    try {
      // Test with a simpler inquiry first
      const testInquiry = new BrokerInquiry({
        productId: productId,
        productTitle: product.title,
        productPrice: product.price,
        buyer: {
          name: name,
          email: email,
          phone: phone || '',
          preferredContact: preferredContact || 'email'
        },
        message: message || '',
        brokerFee: brokerFee,
        totalPrice: totalPrice
      });
      
      console.log('🔍 Test inquiry object:', testInquiry);
      
      await testInquiry.save();
      console.log('✅ Inquiry saved successfully with ID:', testInquiry._id);
      
      // Use the test inquiry instead of the original one
      inquiry = testInquiry;
    } catch (saveError) {
      console.error('❌ Error saving inquiry:', saveError);
      console.error('❌ Save error details:', saveError.message);
      if (saveError.errors) {
        Object.keys(saveError.errors).forEach(key => {
          console.error(`❌ Validation error for ${key}:`, saveError.errors[key].message);
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save inquiry to database',
        error: process.env.NODE_ENV === 'development' ? saveError.message : 'Database save error'
      });
    }

    console.log('🔔 New Broker Inquiry Saved:', {
      inquiryId: inquiry._id,
      productTitle: product.title,
      buyer: { name, email, phone },
      brokerFee,
      totalPrice,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Your inquiry has been submitted successfully. Our broker team will contact you within 24 hours.',
      inquiryId: inquiry._id
    });
  } catch (error) {
    console.error('❌ Broker contact error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit inquiry. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Simple test endpoint to create inquiry
router.post('/test-inquiry', async (req, res) => {
  try {
    console.log('🧪 Testing inquiry creation...');
    
    const testInquiry = new BrokerInquiry({
      productId: '507f1f77bcf86cd799439011', // Test ObjectId
      productTitle: 'Test Product',
      productPrice: 100,
      buyer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        preferredContact: 'email'
      },
      message: 'Test message',
      brokerFee: 5,
      totalPrice: 105
    });
    
    console.log('🔍 Test inquiry object:', testInquiry);
    
    await testInquiry.save();
    console.log('✅ Test inquiry saved successfully with ID:', testInquiry._id);
    
    res.json({
      success: true,
      message: 'Test inquiry created successfully',
      inquiryId: testInquiry._id
    });
  } catch (error) {
    console.error('❌ Test inquiry creation failed:', error);
    console.error('❌ Error details:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`❌ Validation error for ${key}:`, error.errors[key].message);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Test inquiry creation failed',
      error: error.message
    });
  }
});

// Get broker statistics (for admin dashboard)
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total inquiries
    const totalInquiries = await BrokerInquiry.countDocuments();
    
    // Get pending inquiries
    const pendingInquiries = await BrokerInquiry.countDocuments({ status: 'pending' });
    
    // Get completed transactions
    const completedTransactions = await BrokerInquiry.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const completedInquiries = await BrokerInquiry.find({ status: 'completed' });
    const totalRevenue = completedInquiries.reduce((sum, inquiry) => sum + inquiry.brokerFee, 0);
    
    // Get this month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthInquiries = await BrokerInquiry.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    const thisMonthCompleted = await BrokerInquiry.find({
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });
    
    const thisMonthRevenue = thisMonthCompleted.reduce((sum, inquiry) => sum + inquiry.brokerFee, 0);
    
    const stats = {
      totalInquiries,
      pendingInquiries,
      completedTransactions,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      thisMonth: {
        inquiries: thisMonthInquiries,
        revenue: parseFloat(thisMonthRevenue.toFixed(2))
      }
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Broker stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch broker statistics.' 
    });
  }
});

// Get all inquiries (for admin dashboard)
router.get('/inquiries', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const inquiries = await BrokerInquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('productId', 'title price images');
    
    const total = await BrokerInquiry.countDocuments(query);
    
    res.json({ 
      success: true, 
      inquiries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Broker inquiries error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inquiries.' 
    });
  }
});

// Update inquiry status
router.put('/inquiries/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const inquiry = await BrokerInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inquiry not found' 
      });
    }
    
    inquiry.status = status;
    inquiry.contactHistory.push({
      action: status,
      notes: notes || `Status changed to ${status}`,
      adminUser: req.user.email || 'admin'
    });
    
    await inquiry.save();
    
    res.json({ 
      success: true, 
      message: `Inquiry ${status} successfully`,
      inquiry 
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update inquiry status.' 
    });
  }
});

// Get single inquiry details
router.get('/inquiries/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const inquiry = await BrokerInquiry.findById(id)
      .populate('productId', 'title price images seller location');
    
    if (!inquiry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inquiry not found' 
      });
    }
    
    res.json({ success: true, inquiry });
  } catch (error) {
    console.error('Get inquiry details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inquiry details.' 
    });
  }
});

// Add admin notes to inquiry
router.post('/inquiries/:id/notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const inquiry = await BrokerInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inquiry not found' 
      });
    }
    
    inquiry.adminNotes = notes;
    inquiry.contactHistory.push({
      action: 'added_notes',
      notes: notes,
      adminUser: req.user.email || 'admin'
    });
    
    await inquiry.save();
    
    res.json({ 
      success: true, 
      message: 'Notes added successfully',
      inquiry 
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add notes.' 
    });
  }
});

module.exports = router; 