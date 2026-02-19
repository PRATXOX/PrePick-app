const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: { // Username add kiya hai
    type: String,
    unique: true,
    sparse: true // Allows null/undefined to not be unique
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['STUDENT', 'VENDOR', 'ADMIN'],
    default: 'STUDENT'
  },
  universityId: { // Student ke liye bhi store kar lete hain (Optional)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- PASSWORD ENCRYPTION (Magic Logic) ---
// Save karne se pehle password ko "Hash" (Encrypt) karo
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login ke waqt password match karne ka method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);