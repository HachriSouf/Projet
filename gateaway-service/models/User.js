const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String, default: null },
  registrationToken: {type: String, default:null}
});


const User = mongoose.model('User', userSchema);
module.exports = User; 


