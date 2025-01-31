const mongoose = require('mongoose');

const combinedBetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bets: [
    {
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
      selectedOutcome: { type: String, enum: ['1', '2', 'X'], required: true },
      status: { type: String, enum: ['pending', 'win', 'lost'], default: 'pending' },
    },
  ],
  combinedOdd: { type: Number, required: true }, 
  betAmount: { type: Number, required: true },  
  potentialWin: { type: Number, required: true }, 
  status: { type: String, enum: ['pending', 'win', 'lost'], default: 'pending' }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CombinedBet', combinedBetSchema);