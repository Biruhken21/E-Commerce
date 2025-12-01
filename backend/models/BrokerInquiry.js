const mongoose = require('mongoose');

const brokerInquirySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productTitle: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  buyer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false
    },
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
      default: 'email'
    }
  },
  message: {
    type: String,
    required: false,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  brokerFee: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  adminNotes: {
    type: String,
    required: false
  },
  contactHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['submitted', 'contacted_buyer', 'contacted_seller', 'approved', 'rejected', 'completed', 'added_notes'],
      required: true
    },
    notes: String,
    adminUser: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
brokerInquirySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
brokerInquirySchema.index({ status: 1, createdAt: -1 });
brokerInquirySchema.index({ productId: 1 });
brokerInquirySchema.index({ 'buyer.email': 1 });

module.exports = mongoose.model('BrokerInquiry', brokerInquirySchema); 