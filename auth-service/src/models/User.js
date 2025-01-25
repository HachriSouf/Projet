const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String, default: null },
  registrationToken: { type: String, default: null },
  registratedAt: { type: Date, default: null },
  lastSignedInAt: { type: Date, default: null },
  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
});


const User = mongoose.model('User', userSchema);
module.exports = User;
