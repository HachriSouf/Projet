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

        // Verify the match status is completed
        if (status !== "completed") {
          console.log(`Match ${matchId} is not completed. Skipping processing.`);
          return;
        }

        // Retrieve all bets associated with the match
        const bets = await Bet.find({ matchId });
        if (bets.length === 0) {
          console.log(`No bets found for match ${matchId}.`);
          return;
        }

        const allCustomersResponse = await customerService.get(`/customer/all-customers`);
        const allCustomers = allCustomersResponse.data.customers;
        console.log("All customers:", allCustomers);

        if (!allCustomers || allCustomers.length === 0) {
          console.error("No customers found.");
          return;
        }

        // Process each bet
        for (const bet of bets) {
          let isWin = false;

          // Check if the bet is a win based on the selectedOutcome
          if (bet.selectedOutcome === "1" && score.home > score.away) {
            isWin = true; // Home team wins
          } else if (bet.selectedOutcome === "2" && score.away > score.home) {
            isWin = true; // Away team wins
          } else if (bet.selectedOutcome === "X" && score.home === score.away) {
            isWin = true; // Draw
          }

          bet.status = isWin ? "win" : "lost";
          await bet.save();
          console.log(`Bet ${bet._id} updated to status: ${bet.status}`);

          // Include detailed information for winners
          if (isWin) {
            const customer = allCustomers.find((cust) => cust.user_id === String(bet.userId));

            if (!customer) {
              console.error(`Customer not found for userId: ${bet.userId}`);
              continue;
            }

            const username = customer.username;

            const updatedBalance = customer.balance + bet.potentialWin;
            await customerService.put(`/customer/${username}`, { balance: updatedBalance });

            console.log(
              `Balance updated for user ${username}: New balance = ${updatedBalance}`
            );

            // Get the email of the user
            try {
              const emailResponse = await authService.get(`/auth/user/${bet.userId}`);
              const email = emailResponse.data.email;

              // Add all the required information to send to the notification service
              const betWithDetails = {
                email,
                username,
                matchId,
                matchDate: date, // From the match data
                homeTeam,
                awayTeam,
                score,
                betAmount: bet.betAmount,
                selectedOutcome: bet.selectedOutcome,
                potentialWin: bet.potentialWin,
                updatedBalance,
              };

              console.log(`Prepared detailed data for bet ${bet._id}:`, betWithDetails);

              // Send detailed information to the notification service queue
              await sendBetWinToQueue(betWithDetails);
            } catch (err) {
              console.error(`Error retrieving email for userId ${bet.userId}:`, err.message);
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
