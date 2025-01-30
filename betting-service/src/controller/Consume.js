const AMQPService = require("../../AMQPService/AMQPService");
const axios = require("axios");
const Bet = require("../model/bet");

const customerService = axios.create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
const authService = axios.create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const consumeMatchEndedMessages = async () => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    console.log("Connected to RabbitMQ successfully.");

    await amqpService.consumeFromQueue("Match_ended", async (msg) => {
      if (msg) {
        console.log("Message received from queue: Match_ended");
        const matchData = JSON.parse(msg.content.toString());
        console.log("Processing match data:", matchData);

        const { matchId, homeTeam, awayTeam, score, date, status } = matchData;

        // Vérifie si le match est terminé
        if (status !== "completed") {
          console.log(`Match ${matchId} is not completed. Skipping processing.`);
          return;
        }

        // Récupérer tous les paris liés au match
        const bets = await Bet.find({ matchId });
        if (bets.length === 0) {
          console.log(`No bets found for match ${matchId}.`);
          return;
        }

        // Traiter chaque pari individuellement
        for (const bet of bets) {
          let isWin = false;

          // Vérification du résultat du pari
          if (bet.selectedOutcome === "1" && score.home > score.away) {
            isWin = true;
          } else if (bet.selectedOutcome === "2" && score.away > score.home) {
            isWin = true;
          } else if (bet.selectedOutcome === "X" && score.home === score.away) {
            isWin = true;
          }

          bet.status = isWin ? "win" : "lost";
          await bet.save();
          console.log(`Bet ${bet._id} updated to status: ${bet.status}`);

          // Si le pari est gagnant, récupérer les infos du client via son user_id
          if (isWin) {
            try {
              // Récupérer les informations du client
              const customerResponse = await customerService.get(`/customer/${bet.userId}`);
              const customer = customerResponse.data.customer;

              // Récupérer l'email de l'utilisateur
              const emailResponse = await authService.get(`/auth/user/${bet.userId}`);
              const email = emailResponse.data.email;

              if (!customer) {
                console.error(`Customer not found for userId: ${bet.userId}`);
                continue;
              }

              const username = customer.username;
              const updatedBalance = customer.balance + bet.potentialWin;

              // Mettre à jour le solde du client
              await customerService.put(`/customer/${bet.userId}`, { balance: updatedBalance });

              console.log(`Balance updated for user ${username}: New balance = ${updatedBalance}`);

              // Préparer les données à envoyer à la notification
              const betWithDetails = {
                email,
                username,
                matchId,
                matchDate: date,
                homeTeam,
                awayTeam,
                score,
                betAmount: bet.betAmount,
                selectedOutcome: bet.selectedOutcome,
                potentialWin: bet.potentialWin,
                updatedBalance,
              };

              console.log(`Prepared detailed data for bet ${bet._id}:`, betWithDetails);

              // Envoyer les infos à la queue de notification
              await sendBetWinToQueue(betWithDetails);
              console.log(`Bet win notification sent for user: ${username} (${email})`);
            } catch (error) {
              console.error(`Error retrieving customer or email for userId ${bet.userId}:`, error.message);
            }
          }
        }
      } else {
        console.log("No message received from queue: Match_ended.");
      }
    });
  } catch (error) {
    console.error("Error during RabbitMQ connection or consumption:", error);
  }
};

const sendBetWinToQueue = async (bet) => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    await amqpService.sendToQueue("WIN", JSON.stringify(bet));
    console.log("Message sent to queue: WIN");
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error.message);
  } finally {
    setTimeout(async () => {
      await amqpService.close();
    }, 5000);
  }
};

module.exports = consumeMatchEndedMessages;
