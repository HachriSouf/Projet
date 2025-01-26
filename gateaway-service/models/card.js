const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvv: { type: String, required: true },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
