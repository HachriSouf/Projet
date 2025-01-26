const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  coefficient: { type: Number, required: true },
});

module.exports = mongoose.model('Team', teamSchema);
