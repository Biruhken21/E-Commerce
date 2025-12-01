const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Automotive', 'Other'],
    default: 'Other'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String, // For Cloudinary
      required: false
    },
    alt: {
      type: String,
      default: 'Product image'
    }
  }],
  seller: {
    name: {
      type: String,
      required: [true, 'Seller name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Seller email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional if user registration is not required
    }
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'inactive'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0].url : null;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
