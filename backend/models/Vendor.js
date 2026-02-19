const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model se link
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University', // University model se link
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  location: { // Shop ka address (e.g., "Block A Canteen")
    type: String,
    required: true
  },
  openTime: {
    type: String,
    required: true
  },
  closeTime: {
    type: String,
    required: true
  },
  isAvailable: { // Shop khuli hai ya band
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vendor', VendorSchema);