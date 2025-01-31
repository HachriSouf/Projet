const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['completed', 'in_progress','scheduled'], default: 'scheduled' },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
