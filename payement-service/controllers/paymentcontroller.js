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
  const customerService = axios.create({
    baseURL: "http://trd_project-customer-service-1:5000",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  const sendPayementSucessMessageToQueue = async (transaction) => {
    const amqpService = new AMQPService(
      `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
    );
  
    try {
      await amqpService.connect();
      await amqpService.sendToQueue("payement_sucess", JSON.stringify(transaction));
      console.log("Message sent to queue: payement_sucess");
    } catch (error) {
      console.error("Error sending message to RabbitMQ:", error.message);
    } finally {
      setTimeout(async () => {
        await amqpService.close(); 
      }, 5000);
    }
  };

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
const username = authResponse.data.user.username;


  if (!amount || amount <= 10) {
    return res.status(400).json({ message: "Amount must be greater than 10 euros" });
  }

  try {

    const card = new Card({
      cardHolderName: cardHolderName,
      cardNumber: cardNumber,
      expiryDate: expiryDate,
      cvv: cvv,

    });
    await card.save();
    const transaction = new Transaction({
      userId,
      amount,
    });
    await transaction.save();

    const message = {
      userId,
      amount,
      transactionId: transaction._id,
      transactionDate: transaction.transactionDate,
    };
    const customerResponse = await customerService.get(`/customer/${userId}`);
    const currentBalance = customerResponse.data.customer.balance;

    const newBalance = currentBalance + amount;
    await customerService.put(`/customer/${userId}`, { balance: newBalance });

    console.log(`Balance updated for user ${username}: ${newBalance}`);

    const sentMessage = { ...message, newBalance,username ,  email: authResponse.data.user.email};
    
    sendPayementSucessMessageToQueue(sentMessage);
   

    res.status(200).json({ message: "Payment processed successfully", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
