const mongoose = require('mongoose');

const payloadSchema = new mongoose.Schema({
  exp: { type: Date, required: true },
  data: {
    id: { type: String, required: true },
  },
});

module.exports = mongoose.model('Payload', payloadSchema);