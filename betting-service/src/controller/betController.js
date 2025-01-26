const Bet = require('../model/bet');
const axios = require('axios');
const AMQPService = require("../../AMQPService/AMQPService");


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
const matchService = axios.create({
    baseURL: "http://trd_project-match-service-1:4002",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });
  const sendBetCreatedMessageToQueue = async (bet) => {
    const amqpService = new AMQPService(
      `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
    );
  
    try {
      await amqpService.connect();
      await amqpService.sendToQueue("bet_created", JSON.stringify(bet));
      console.log("Message sent to queue: bet_created");
    } catch (error) {
      console.error("Error sending message to RabbitMQ:", error.message);
    } finally {
      setTimeout(async () => {
        await amqpService.close(); 
      }, 5000);
    }
  };

  exports.createBet = async (req, res) => {
    try {
      const { matchId, oddId, betAmount } = req.body;
  
      // Vérifier le token JWT via Auth-Service
      const token = req.header('Authorization')?.split(' ')[1];
      console.log("le token : ", token);
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const authResponse = await authService.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('authresponse : ',authResponse.data.user);
      const username = authResponse.data.user.username;
  
      const customerResponse = await customerService.get(`/customer/${username}`);
      console.log('customerResponse : ',customerResponse.data.customer);
      const customer = customerResponse.data.customer;
  
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      if (customer.balance < betAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
  
      const match = {
        id: matchId,
        teams: ["Barça", "Madrid"],
        date: "2025-01-30T20:00:00Z",
      };
  
      const oddValue = 2.0; 
      const potentialWin = betAmount * oddValue;
  
      const newBet = new Bet({
        userId: authResponse.data.user._id,
        matchId: match.id,
        oddId,
        betAmount,
        potentialWin,
      });

      console.log('saving...');

      await newBet.save();
  
      await customerService.put(`/customer/${username}`, {
        balance: customer.balance - betAmount,
      });
      console.log('sending message to queue....');
      const sentBet = { ...newBet.toObject(), email: authResponse.data.user.email };
      await sendBetCreatedMessageToQueue(sentBet);

      console.log('message sent !');

      res.status(201).json({ message: 'Bet created successfully', bet: newBet });
    } catch (err) {
      console.error('Error creating bet:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getBetById = async (req, res) => {
    try {
        const { id } = req.params;
        const bet = await Bet.findById(id);

        if (!bet) {
            return res.status(404).json({ message: 'Bet not found' });
        }

        res.status(200).json({ bet });
    } catch (err) {
        console.error('Error fetching bet:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Récupérer tous les paris d'un utilisateur
exports.getBetsByUser = async (req, res) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const authResponse = await authService.get("/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const username = authResponse.data.user.username;

        const bets = await Bet.find({ username });
        res.status(200).json({ bets });
    } catch (err) {
        console.error('Error fetching bets:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mettre à jour un pari (par exemple, statut "won" ou "lost")
exports.updateBet = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedBet = await Bet.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBet) {
            return res.status(404).json({ message: 'Bet not found' });
        }

        res.status(200).json({ message: 'Bet updated successfully', bet: updatedBet });
    } catch (err) {
        console.error('Error updating bet:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Supprimer un pari
exports.deleteBet = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBet = await Bet.findByIdAndDelete(id);

        if (!deletedBet) {
            return res.status(404).json({ message: 'Bet not found' });
        }

        res.status(200).json({ message: 'Bet deleted successfully' });
    } catch (err) {
        console.error('Error deleting bet:', err);
        res.status(500).json({ message: 'Server error' });
    }
};