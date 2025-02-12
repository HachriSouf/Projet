const mongoose = require('mongoose');

const oddSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeOdd: { type: Number, required: true },
  drawOdd: { type: Number, required: true },
  awayOdd: { type: Number, required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  boosted: {
    type: Boolean,
    default: false, 
  },
  boostDetails: {
    boostedBy: { type: mongoose.Schema.Types.ObjectId}, 
    boostDuration: { type: Number, default: 1 }, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Odd', oddSchema);
