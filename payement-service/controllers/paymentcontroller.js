const jwt = require("jsonwebtoken");
const axios = require('axios');
const Card = require("../models/card");
const Transaction = require("../models/Transation");
const AMQPService = require("../services/AMPQService");

const authService = axios.create({
    baseURL: "http://trd_project-auth-service-1:3000",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

exports.processPayment = async (req, res) => {
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
  const { amount, cardHolderName, cardNumber, expiryDate, cvv} = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  const authResponse = await authService.get("/auth/verify", {
    headers: { Authorization: `Bearer ${token}` },
});

const userId = authResponse.data.user._id;
  if (!amount || amount <= 10) {
    return res.status(400).json({ message: "Amount must be greater than 10 euros" });
  }
console.log("error",req.body);
  try {
    // Step 1: Verify User


    

    // Save card details (if needed)
    const card = new Card({
      cardHolderName: cardHolderName,
      cardNumber: cardNumber,
      expiryDate: expiryDate,
      cvv: cvv,
    });
    await card.save();

    // Step 3: Save Transaction
    const transaction = new Transaction({
      userId,
      amount,
    });
    await transaction.save();

    // Step 4: Send Message to Queue
    const amqpService = new AMQPService(
      `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
    );

    const message = {
      userId,
      amount,
      transactionId: transaction._id,
      transactionDate: transaction.transactionDate,
    };

    try {
      await amqpService.connect();
      await amqpService.sendToQueue("payment_success", JSON.stringify(message));
      console.log("Payment success message sent to queue");
    } catch (error) {
      console.error("Error sending message to RabbitMQ:", error.message);
    } finally {
      setTimeout(async () => {
        await amqpService.close();
      }, 5000);
    }

    res.status(200).json({ message: "Payment processed successfully", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
