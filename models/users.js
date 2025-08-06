const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: { type: String },
  profilePic: { type: String },

  // 🆕 Address fields
  street: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  country: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active',
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
