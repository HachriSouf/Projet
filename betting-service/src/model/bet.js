const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  matchId: { type: String, required: true }, 
  oddId: { type: String, required: true },   // ID de la cote choisie avec les jeux de donnée fournis par le prof.
  betAmount: { type: Number, required: true }, 
  potentialWin: { type: Number },           
  status: {                                 
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Bet', betSchema);