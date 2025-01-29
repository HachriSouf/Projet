const express = require('express');
const Odd = require('../models/Odd');
const router = express.Router();
const axios = require('axios');
const verifyBookmaker = require('../MiddleWare/Verify');
const AMQPService = require('../AMQPService/AMQPService');

const authService = axios.create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});



  router.put('/:matchId', verifyBookmaker, async (req, res) => {
    try {
      const { matchId } = req.params;
      const { homeOdd, drawOdd, awayOdd } = req.body;
  
      
      const updatedOdd = await Odd.findOneAndUpdate(
        { matchId },
        { homeOdd, drawOdd, awayOdd },
        { new: true }
      );
  
      if (!updatedOdd) {
        return res.status(404).json({ error: 'Odds not found for this match.' });
      }
  
      res.status(200).json({
        message: 'Odds updated successfully.',
        odds: updatedOdd,
      });
    } catch (err) {
      console.error('Error while updating odds:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.patch('/deboost/:matchId', verifyBookmaker, async (req, res) => {
    try {
      const { matchId } = req.params;
  
      // Vérifiez si des cotes existent pour ce match
      const existingOdd = await Odd.findOne({ matchId });
      if (!existingOdd) {
        return res.status(404).json({ error: 'Odds not found for this match.' });
      }
  
      // Mettre à jour les cotes pour retirer le boost
      const updatedOdd = await Odd.findOneAndUpdate(
        { matchId },
        {
          boosted: false, // Désactiver le boost
          boostDetails: {}, // Supprimer les détails du boost
        },
        { new: true } // Retourner le document mis à jour
      );
  
      res.status(200).json({
        message: 'Odds successfully deboosted.',
        odds: updatedOdd,
      });
    } catch (err) {
      console.error('Error deboosting odds:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.patch('/boost/:matchId', verifyBookmaker, async (req, res) => {
    try {
      const { matchId } = req.params;
      const { homeOdd, drawOdd, awayOdd, boostDuration } = req.body;
  
      // Vérifiez si des cotes existent pour ce match
      const existingOdd = await Odd.findOne({ matchId });
      if (!existingOdd) {
        return res.status(404).json({ error: 'Odds not found for this match.' });
      }
  
      // Mettre à jour les cotes boostées
      const updatedOdd = await Odd.findOneAndUpdate(
        { matchId },
        {
          homeOdd: homeOdd || existingOdd.homeOdd,
          drawOdd: drawOdd || existingOdd.drawOdd,
          awayOdd: awayOdd || existingOdd.awayOdd,
          boosted: true,
          boostDetails: {
            boostedBy: req.user._id, 
            boostDuration: boostDuration || 1, 
          },
        },
        { new: true } 
      );
  
      res.status(200).json({
        message: 'Odds successfully boosted.',
        odds: updatedOdd,
      });
    } catch (err) {
      console.error('Error boosting odds:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  const sendProposeMessageToQueue = async (odds) => {
    const amqpService = new AMQPService(
      `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
    );
  
    try {
      await amqpService.connect();
      await amqpService.sendToQueue("Propose", JSON.stringify(odds));
      console.log("Message sent to queue: Propose");
    } catch (error) {
      console.error("Error sending message to RabbitMQ:", error.message);
    } finally {
      setTimeout(async () => {
        await amqpService.close(); 
      }, 5000);
    }
  };
  const bookmakerService = axios.create({
    baseURL: "http://trd_project-bookmaker-service-1:4004",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });
  const matchService = axios.create({
    baseURL: "http://trd_project-match-service-1:4007",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  router.get('/propose', verifyBookmaker, async (req, res) => {
    try {
        const bookmakerId = req.user._id;

        const bookmakerResponse = await bookmakerService.get(`/bookmaker/${bookmakerId}`);
        const bookmakerData = bookmakerResponse.data.bookmaker;
        if (!bookmakerData) {
            return res.status(404).json({ error: "Bookmaker not found." });
        }

        const username = bookmakerData.username;

        const boostedOdds = await Odd.find({
            boosted: true,
            'boostDetails.boostedBy': bookmakerId,
        });

        if (!boostedOdds.length) {
            return res.status(404).json({ error: 'No boosted odds found for this bookmaker.' });
        }

        const boostedOddsWithDate = await Promise.all(
            boostedOdds.map(async (odd) => {
                const matchResponse = await matchService.get(`/matches/${odd.matchId}`).catch(() => null);

                return {
                    matchId: odd.matchId,
                    homeTeam: odd.homeTeam,
                    awayTeam: odd.awayTeam,
                    homeOdd: odd.homeOdd,
                    drawOdd: odd.drawOdd,
                    awayOdd: odd.awayOdd,
                    date: matchResponse ? matchResponse.data.match.date : "N/A",
                };
            })
        );

        const authResponse = await authService.get('/auth/getAllUsersGamble');
        const users = authResponse.data.users;

        if (!users.length) {
            return res.status(404).json({ error: 'No users found to send boosted odds.' });
        }
        const message = {
            users: users.map(user => ({
                userId: user._id,
                email: user.email,
            })),
            bookmakerUsername: username,
            boostedOdds: boostedOddsWithDate,
        };

        sendProposeMessageToQueue(message);

        res.status(200).json({
            message: 'Boosted odds successfully sent to all users in a single message.',
            boostedOdds: boostedOddsWithDate,
            users: users.map(user => ({ id: user._id, email: user.email })),
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

  router.get('/:matchId',verifyBookmaker , async (req, res) => {
    try {
      const { matchId } = req.params;
  
      const odd = await Odd.findOne({ matchId });
      if (!odd) {
        return res.status(404).json({ error: 'Cotes non trouvées pour ce match.' });
      }
  
      res.status(200).json(odd);
    } catch (err) {
      console.error('Erreur lors de la récupération des cotes :', err);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  });

  

  router.delete('/:matchId', verifyBookmaker, async (req, res) => {
    try {
      const { matchId } = req.params;
  
      const deletedOdd = await Odd.findOneAndDelete({ matchId });
  
      if (!deletedOdd) {
        return res.status(404).json({ error: 'Odds not found for this match.' });
      }
  
      res.status(200).json({
        message: 'Odds deleted successfully.',
      });
    } catch (err) {
      console.error('Error while deleting odds:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  module.exports = router;