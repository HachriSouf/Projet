const Bet = require('../model/bet');
const CombinedBet = require('../model/conbinedBet');
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
    baseURL: "http://trd_project-match-service-1:4007",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  const oddService = axios.create({
    baseURL: "http://trd_project-odd-service-1:4005",
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
  
  const sendBetCombinedCreatedMessageToQueue = async (bet) => {
    const amqpService = new AMQPService(
      `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
    );
  
    try {
      await amqpService.connect();
      await amqpService.sendToQueue("combinedBet_created", JSON.stringify(bet));
      console.log("Message sent to queue: combinedBet_created");
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
      const { matchId, betAmount, selectedOutcome } = req.body; // Ajout de selectedOutcome
      console.log("LE ID DU MATCH ///////////// : ", matchId);
  
      // Vérifier le token JWT via Auth-Service
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      const authResponse = await authService.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("authResponse:", authResponse.data.user);
      const username = authResponse.data.user.username;
      const verified = authResponse.data.user.registrationToken;
      if (verified !== null) {
        return res
          .status(403)
          .json({ message: "You need to verify your account to play a bet" });
      }
      // Vérifier le client via Customer-Service
      const customerResponse = await customerService.get(`/customer/${username}`);
      const customer = customerResponse.data.customer;
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      if (customer.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      // Vérifier le match via Match-Service
      const matchResponse = await matchService.get(`/matches/${matchId}`);
      const match = matchResponse.data.match;
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
  
      // Vérifier les cotes via Odd-Service
      const oddResponse = await oddService.get(`/odds/${matchId}`);
      const odd = oddResponse.data;
      
      if (!odd || odd.matchId !== matchId) {
        return res.status(404).json({ message: "Odds not found for this match." });
      }
  
      if (!["1", "2", "X"].includes(selectedOutcome)) {
        return res.status(400).json({ message: "Invalid selected outcome. Choose 1 (home), 2 (away), or X (draw)." });
      }
  
      let selectedOdd;
      if (selectedOutcome === "1") {
        selectedOdd = odd.homeOdd; 
      } else if (selectedOutcome === "2") {
        selectedOdd = odd.awayOdd; 
      } else if (selectedOutcome === "X") {
        selectedOdd = odd.drawOdd; 
      }
  
      const potentialWin = (betAmount * selectedOdd).toFixed(2);
  
      const newBet = new Bet({
        userId: authResponse.data.user._id,
        matchId,
        betAmount,
        potentialWin,
        selectedOutcome, 
      });
  
      console.log("Saving bet...");
  
      await newBet.save();
  
      await customerService.put(`/customer/${username}`, {
        balance: customer.balance - betAmount,
      });
  
      console.log("Sending bet to queue...");

      const homeTeam = match.homeTeam;
      const awayTeam = match.awayTeam;
      
      const sentBet = { ...newBet.toObject(), email: authResponse.data.user.email, username : customer.username ,awayTeam,homeTeam};
      await sendBetCreatedMessageToQueue(sentBet);
  
      console.log("Bet sent to queue!");
  
      res.status(201).json({ message: "Bet created successfully", bet: newBet });
    } catch (err) {
      console.error("Error creating bet:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.createCombinedBet = async (req, res) => {
    try {
      const { bets, betAmount } = req.body;
  
      if (!bets || bets.length < 2) {
        return res.status(400).json({ message: "A combined bet must include at least two bets." });
      }
  
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      const authResponse = await authService.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const userId = authResponse.data.user._id;
      const username = authResponse.data.user.username;
      const verified = authResponse.data.user.registrationToken;
      if (verified !== null) {
        return res
          .status(403)
          .json({ message: "You need to verify your account to play a bet" });
      }
      
      const customerResponse = await customerService.get(`/customer/${username}`);
      const customer = customerResponse.data.customer;
  
      if (!customer || customer.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance." });
      }
  
      let combinedOdd = 1; 
      for (const bet of bets) {

        const matchResponse = await matchService.get(`/matches/${bet.matchId}`);
        const match = matchResponse.data.match;
        if (!match) {
          return res.status(404).json({ message: `Match not found: ${bet.matchId}` });
        }
        bet.homeTeam = match.homeTeam;
        bet.awayTeam = match.awayTeam;


        const oddResponse = await oddService.get(`/odds/${bet.matchId}`);
        const odd = oddResponse.data;

        if (!odd) {
          return res.status(404).json({ message: `Odds not found for match: ${bet.matchId}` });
        }
  
        const selectedOdd =
          bet.selectedOutcome === "1" ? odd.homeOdd : bet.selectedOutcome === "2" ? odd.awayOdd : odd.drawOdd;
  
        if (!selectedOdd) {
          return res.status(400).json({ message: "Invalid selected outcome." });
        }
  
        combinedOdd *= selectedOdd;
      }
  
      const potentialWin = (betAmount * combinedOdd).toFixed(2);
  
      const combinedBet = new CombinedBet({
        userId,
        bets,
        combinedOdd,
        betAmount,
        potentialWin,
      });
  
      await combinedBet.save();
  
      // Update user balance
      await customerService.put(`/customer/${username}`, {
        balance: customer.balance - betAmount,
      });
  
      console.log("Combined bet created and user balance updated.");
  
      res.status(201).json({
        message: "Combined bet created successfully!",
        combinedBet,
      });
      const sentBet = { ...combinedBet.toObject(), email: authResponse.data.user.email, username : customer.username, bets};

      // Send message to RabbitMQ
      await sendBetCombinedCreatedMessageToQueue(sentBet);
    } catch (error) {
      console.error("Error creating combined bet:", error);
      res.status(500).json({ message: "Server error." });
    }
  };


  exports.updateCombinedBet = async (req, res) => {
    try {
      const { id } = req.params; // Combined Bet ID
      const { matchId, status } = req.body; // Match and status to update
  
      if (!matchId || !status) {
        return res.status(400).json({ message: "matchId and status are required." });
      }
  
      // Find the combined bet by ID
      const combinedBet = await CombinedBet.findById(id);
  
      if (!combinedBet) {
        return res.status(404).json({ message: "Combined bet not found." });
      }
  
      // Update the status for the specific matchId in bets
      let matchFound = false;
  
      combinedBet.bets.forEach((bet) => {
        if (String(bet.matchId) === String(matchId)) {
          bet.status = status; // Update the status
          matchFound = true;
        }
      });
  
      if (!matchFound) {
        return res.status(404).json({ message: `Match with ID ${matchId} not found in combined bet.` });
      }
  
      // Save the updated combined bet
      const updatedCombinedBet = await combinedBet.save();
  
      res.status(200).json({
        message: "Bet status updated successfully.",
        combinedBet: updatedCombinedBet,
      });
    } catch (err) {
      console.error("Error updating combined bet status:", err);
      res.status(500).json({ message: "Server error." });
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