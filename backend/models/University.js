const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ek naam ki ek hi university hogi
  },
  image: {
    type: String, // College ki photo URL
    default: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000'
  },
  location: {
    type: String,
    default: 'India'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('University', UniversitySchema);