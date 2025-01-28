const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  matchId: { type: String, required: true }, 
  betAmount: { type: Number, required: true }, 
  potentialWin: { type: Number },           
  status: {                                 
    type: String,
    enum: ['pending', 'win', 'lost', 'cancelled'],
    default: 'pending',
  },
  selectedOutcome: {                       
    type: String,
    enum: ['1', '2', 'X'],                
    required: true,
  },
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Bet', betSchema);