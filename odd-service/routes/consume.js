const AMQPService = require("../AMQPService/AMQPService");
const Odd = require("../models/Odd");
const axios = require("axios");

const consumeMatchCreatedMessage = async () => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    console.log("Connected to RabbitMQ successfully.");

    await amqpService.consumeFromQueue("Match_added", async (msg) => {
      if (msg) {
        console.log("Message received from queue: Match_added");
        const match = JSON.parse(msg.content.toString());
        console.log("Processing match data:", match);

        const { homeTeam, awayTeam, _id: matchId } = match;

        try {
          // Crée les cotes pour le match
          await createOdds({ homeTeam, awayTeam, matchId });
        } catch (error) {
          console.error("Error creating odds:", error.message);
        } 
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error.message);
  }
};

const createOdds = async ({ homeTeam, awayTeam, matchId }) => {
    try {
      // Récupère les données des équipes depuis le service `team-service`
      const homeResponse = await axios.get(`http://team-service:4006/teams/name/${homeTeam}`);
      const awayResponse = await axios.get(`http://team-service:4006/teams/name/${awayTeam}`);
  
      const homeTeamData = homeResponse.data;
      const awayTeamData = awayResponse.data;
  
      if (!homeTeamData || !awayTeamData) {
        throw new Error("One or both teams not found.");
      }
  
      const homeCoefficient = homeTeamData.coefficient;
      const awayCoefficient = awayTeamData.coefficient;
  
      // Calcul des probabilités
      const totalCoefficient = homeCoefficient + awayCoefficient;
      const probHome = homeCoefficient / totalCoefficient;
      const probAway = awayCoefficient / totalCoefficient;
      let probDraw = 1 - (probHome + probAway);
  
      if (probDraw <= 0) probDraw = 0.01; // Valeur minimale
  
      // Calcul des cotes
      const homeOdd = (1 / probHome).toFixed(2);
      const awayOdd = (1 / probAway).toFixed(2);
      const drawOdd = (1 / probDraw).toFixed(2);
  
      console.log("Odds calculated:", { homeOdd, drawOdd, awayOdd });
  
      // Sauvegarde dans la base de données
      const odd = new Odd({
        homeTeam,
        awayTeam,
        homeOdd,
        drawOdd,
        awayOdd,
        matchId,
      });
  
      await odd.save();
      console.log("Odds created successfully:", odd);
    } catch (error) {
      console.error("Error calculating odds:", error.message);
      throw error;
    }
  };

  module.exports = consumeMatchCreatedMessage;