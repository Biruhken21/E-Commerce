const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'available' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (condition && condition !== 'all') {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    let products = await Product.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Add imageUrl to each product for frontend compatibility
    products = products.map(product => {
      const productObj = product.toObject();
      productObj.imageUrl = productObj.images && productObj.images.length > 0 ? productObj.images[0].url : '';
      return productObj;
    });

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    // Add imageUrl for frontend compatibility
    const productObj = product.toObject();
    productObj.imageUrl = productObj.images && productObj.images.length > 0 ? productObj.images[0].url : '';

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Public (can be protected later)
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('condition').isIn(['Excellent', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
  body('category').isIn(['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Automotive', 'Other']).withMessage('Invalid category'),
  body('seller.name').trim().isLength({ min: 1 }).withMessage('Seller name is required'),
  body('seller.email').isEmail().withMessage('Valid email is required'),
  body('location.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('location.state').trim().isLength({ min: 1 }).withMessage('State is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const productData = req.body;
    // If imageUrl is provided, add it to images array (for backward compatibility)
    if (productData.imageUrl && !productData.images) {
      productData.images = [{ url: productData.imageUrl, alt: productData.title || 'Product image' }];
    }
    // If images array is provided, ensure it has the correct structure
    if (productData.images && Array.isArray(productData.images)) {
      productData.images = productData.images.map(img => {
        if (typeof img === 'string') {
          return { url: img, alt: productData.title || 'Product image' };
        }
        return img;
      });
    }
    const product = new Product(productData);
    await product.save();

    // Add imageUrl to response for frontend compatibility
    const productObj = product.toObject();
    productObj.imageUrl = productObj.images && productObj.images.length > 0 ? productObj.images[0].url : '';

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productObj
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Public (should be protected to owner only)
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('condition').optional().isIn(['Excellent', 'Good', 'Fair', 'Poor']),
  body('category').optional().isIn(['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Automotive', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Public (should be protected to owner only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// @route   POST /api/products/:id/favorite
// @desc    Toggle product favorite
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const isFavorited = product.favorites.includes(req.user._id);
    
    if (isFavorited) {
      product.favorites.pull(req.user._id);
    } else {
      product.favorites.push(req.user._id);
    }

    await product.save();

    res.json({
      success: true,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
});

module.exports = router;
