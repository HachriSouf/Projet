const mongoose = require('mongoose');

const BookmakerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true }, 
    username: { type: String, required: true, unique: true }, 
    FirstName: { type: String, required: true }, 
    LastName: { type: String, required: true }, 
    Number: { type: Number, required: true }, 
    active: { type: Boolean, default: true }, 
    Odds: [{ type: mongoose.Schema.Types.ObjectId }], 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }, 
    deletedAt: { type: Date } 
  });

const Bookmaker = mongoose.model('Bookmaker', BookmakerSchema);
module.exports = Bookmaker;