const AMQPService = require("../../AMQPService/AMQPService");
const CombinedBet = require("../model/conbinedBet");

const customerService = require("axios").create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
const authService = require("axios").create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const matchService = require("axios").create({
  baseURL: "http://trd_project-match-service-1:4007",
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
        
        const { matchId, score, status, homeTeam, awayTeam, date } = matchData;
        
        if (status !== "completed") {
          console.log(`Match ${matchId} is not completed. Skipping processing.`);
          return;
        }

        console.log(`Looking for combined bets containing match: ${matchId}`);
        const combinedBets = await CombinedBet.find({ "bets.matchId": matchId });

        if (combinedBets.length === 0) {
          console.log(`No combined bets found for match ${matchId}.`);
          return;
        }

        console.log(`Found ${combinedBets.length} combined bets related to match ${matchId}.`);

        for (const combinedBet of combinedBets) {
          console.log(`Processing combined bet: ${combinedBet._id}`);

          let isLost = false;
          let allMatchesCompleted = true;

          combinedBet.bets.forEach((bet) => {
            if (String(bet.matchId) === String(matchId)) {
              console.log(`Updating bet ${bet.matchId} inside combined bet ${combinedBet._id}`);
              
              bet.homeTeam = homeTeam;
              bet.awayTeam = awayTeam;
              bet.date = date;
              bet.score = { home: score.home, away: score.away };

              bet.status =
                (bet.selectedOutcome === "1" && score.home > score.away) ||
                (bet.selectedOutcome === "2" && score.away > score.home) ||
                (bet.selectedOutcome === "X" && score.home === score.away)
                  ? "win"
                  : "lost";

              console.log(`Bet ${bet.matchId} updated with status: ${bet.status}`);

              if (bet.status === "lost") {
                isLost = true;
              }
            }

            if (bet.status === "pending") {
              allMatchesCompleted = false;
            }
          });

          if (!allMatchesCompleted) {
            console.log(`Combined bet ${combinedBet._id} still has pending bets. Skipping status update.`);
          } else {
            console.log(`Before update, combined bet ${combinedBet._id} status: ${combinedBet.status}`);
            combinedBet.status = isLost ? "lost" : "win";
            console.log(`After update, combined bet ${combinedBet._id} status: ${combinedBet.status}`);

            if (combinedBet.status === "win") {
              try {
                console.log(`Fetching customer info for user: ${combinedBet.userId}`);
                const customerResponse = await customerService.get(`/customer/${combinedBet.userId}`);
                const customer = customerResponse.data.customer;

                console.log(`Fetching email info for user: ${combinedBet.userId}`);
                const emailResponse = await authService.get(`/auth/user/${combinedBet.userId}`);
                const userEmail = emailResponse.data.email;

                if (customer) {
                  const updatedBalance = customer.balance + combinedBet.potentialWin;
                  await customerService.put(`/customer/${combinedBet.userId}`, { balance: updatedBalance });
                  console.log(`Customer ${combinedBet.userId} balance updated: New balance = $${updatedBalance}`);


                  const matchDetails = await Promise.all(
                    combinedBet.bets.map(async (bet) => {
                      try {
                        const matchResponse = await matchService.get(`/matches/${bet.matchId}`);
                        const matchData = matchResponse.data.match;
                        return {
                          matchId: bet.matchId,
                          homeTeam: matchData.homeTeam || "Unknown Team",
                          awayTeam: matchData.awayTeam || "Unknown Team",
                          date: matchData.date ? new Date(matchData.date).toISOString() : "Unknown Date",
                          score: matchData.score ? matchData.score : { home: "N/A", away: "N/A" },
                          selectedOutcome: bet.selectedOutcome || "undefined",
                          status: bet.status || "pending",
                        };
                      } catch (error) {
                        console.error(`Error fetching match ${bet.matchId}:`, error.message);
                      }
                    })
                  );
                  console.log("matchDetails que j'ai preparer avec amour : ",matchDetails);

                  const betData = {
                    email: userEmail,
                    username: customer.username,
                    combinedBetId: combinedBet._id,
                    potentialWin: combinedBet.potentialWin,
                    updatedBalance,
                    matchDetails,
                  };

                  console.log(`Preparing to send bet win data for user: ${customer.username} (${userEmail})`);
                  await sendBetWinToQueue(betData);
                  console.log(`Bet win data sent successfully for user: ${customer.username} (${userEmail})`);
                }
              } catch (error) {
                console.error(`Error processing combined bet for user ${combinedBet.userId}:`, error.message);
              }
            }
          }

          console.log(`Saving updated combined bet ${combinedBet._id} with status: ${combinedBet.status}`);
          await combinedBet.save();
          console.log(`Combined bet ${combinedBet._id} saved successfully.`);
        }
      } else {
        console.log("No message received from queue: Match_ended_combined.");
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
    await amqpService.sendToQueue("Combined_WIN", JSON.stringify(bet));
    console.log("Message sent to queue: Combined_WIN");
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error.message);
  } finally {
    setTimeout(async () => {
      await amqpService.close();
    }, 5000);
  }
};

module.exports = consumeCombinedBets;
