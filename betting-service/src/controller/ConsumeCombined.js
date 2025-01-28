const AMQPService = require("../../AMQPService/AMQPService");
const CombinedBet = require("../model/conbinedBet");

const customerService = require("axios").create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const consumeCombinedBets = async () => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    console.log("Connected to RabbitMQ successfully.");

    await amqpService.consumeFromQueue("Match_ended_combined", async (msg) => {
      if (msg) {
        console.log("Message received from queue: Match_ended_combined");
        const matchData = JSON.parse(msg.content.toString());
        console.log("Processing match data:", matchData);

        const { matchId, score, status } = matchData;

        if (status !== "completed") {
          console.log(`Match ${matchId} is not completed. Skipping processing.`);
          return;
        }

        // Find all combined bets involving this match
        const combinedBets = await CombinedBet.find({ "bets.matchId": matchId });
        if (combinedBets.length === 0) {
          console.log(`No combined bets found for match ${matchId}.`);
          return;
        }

        // Process each combined bet
        for (const combinedBet of combinedBets) {
          let isLost = false;

          // Update the status of the specific bet within the combined bet
          combinedBet.bets.forEach((bet) => {
            if (String(bet.matchId) === String(matchId)) {
              const isWin =
                (bet.selectedOutcome === "1" && score.home > score.away) ||
                (bet.selectedOutcome === "2" && score.away > score.home) ||
                (bet.selectedOutcome === "X" && score.home === score.away);

              bet.status = isWin ? "win" : "lost";
              if (!isWin) isLost = true; // If any bet is lost, the combined bet is lost
            }
          });

          // Update the combined bet's overall status
          if (isLost) {
            combinedBet.status = "lost";
          } else if (combinedBet.bets.every((bet) => bet.status === "win")) {
            combinedBet.status = "win";

            // Update customer balance
            const customerResponse = await customerService.get(`/customer/${combinedBet.userId}`);
            const customer = customerResponse.data.customer;

            if (customer) {
              const updatedBalance = customer.balance + combinedBet.potentialWin;
              await customerService.put(`/customer/${combinedBet.userId}`, { balance: updatedBalance });

              console.log(
                `Customer ${combinedBet.userId} balance updated: New balance = $${updatedBalance}`
              );

              // Send notification for winning combined bet
              await sendBetWinToQueue({
                email: customer.email,
                username: customer.username,
                combinedBetId: combinedBet._id,
                potentialWin: combinedBet.potentialWin,
                updatedBalance,
              });
            }
          }

          // Save the updated combined bet
          await combinedBet.save();
          console.log(`Combined bet ${combinedBet._id} updated to status: ${combinedBet.status}`);
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

module.exports = consumeCombinedBets;
