const AMQPService = require("../../AMQPService/AMQPService");
const axios = require('axios');
const Bet = require("../model/bet"); 

const customerService = axios.create({
  baseURL: "http://trd_project-customer-service-1:5000",
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

        const { matchId, score } = matchData;

        // Retrieve all bets associated with the match
        const bets = await Bet.find({ matchId });
        if (bets.length === 0) {
          console.log(`No bets found for match ${matchId}.`);
          return;
        }

        const allCustomersResponse = await customerService.get(`/customer/all-customers`);
        const allCustomers = allCustomersResponse.data.customers;

        if (!allCustomers || allCustomers.length === 0) {
          console.error("No customers found.");
          return;
        }

        // Process each bet
        for (const bet of bets) {

          const isWin = score.home >= score.away; // Adjust this condition as needed
          bet.status = isWin ? "win" : "lost";

          await bet.save();
          console.log(`Bet ${bet._id} updated to status: ${bet.status}`);

          if (isWin) {

            const customer = allCustomers.find((cust) => cust.userId === bet.userId);

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
            await sendBetWinToQueue(bet);
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
