const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Number: { type: Number, required: true },
  balance:{ type: Number, default: 0 },
  createdAt: {type: Date, default: Date.now},
  deletedAt: {type: Date},
  updateAt:{type: Date}
});

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;
