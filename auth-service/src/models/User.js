const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String, default: null },
  registrationToken: {type: String, default:null},
  role: { type: Number,  enum: [0, 1], default: 0,},
  lastSignedAt: { type: String, default: null },
  createdAt: {type: Date, default: Date.now},
  registeredAt: {type: Date},
  deletedAt: {type: Date},
  updateAt:{type: Date}
},{ timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;
