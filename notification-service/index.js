const AMQPService = require("./Services/AMQPService");
const sendMail = require("./Services/MailService");
const fs = require("fs");
const path = require("path");

const MESSAGE_BROKER = process.env.MESSAGE_BROKER;
const MESSAGE_BROKER_USER = process.env.MESSAGE_BROKER_USER;
const MESSAGE_BROKER_PASSWORD = process.env.MESSAGE_BROKER_PASSWORD;


const imagePath = path.join(__dirname, "image.png");
const imageBase64 = fs.readFileSync(imagePath, "base64");
const imageSrc = `data:image/png;base64,${imageBase64}`;

const readFromQueue = async () => {
  console.log("Initializing AMQP Service...");

  const amqpService = new AMQPService(
    `amqp://${MESSAGE_BROKER_USER}:${MESSAGE_BROKER_PASSWORD}@${MESSAGE_BROKER}`
  );
 
  try {
    await amqpService.connect();
    console.log("Connected to RabbitMQ successfully.");

    await amqpService.consumeFromQueue("customer_created", (msg) => {
      if (msg) {
        console.log("Message received from queue: customer_created");
        const customer = JSON.parse(msg.content.toString());
        console.log("Processing customer data:", customer);

        // Read image and encode it in Base64

        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <div style="text-align: center;">
              <img src="${imageSrc}" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
            </div>
            <h1 style="text-align: center; color: #007BFF;">Welcome to The Real Deal!</h1>
            <p>Hi <strong>${customer.FirstName} ${customer.LastName}</strong>,</p>
            <p>We are thrilled to have you with us. Please confirm your registration by clicking the link below:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href='http://localhost:8000/api/double-opt-in?t=${customer.registrationToken}'
                 style="display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Confirm Registration</a>
            </div>
            <p>If you didn’t request this, please ignore this email.</p>
            <p>Thank you,<br/>The Real Deal Team</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; text-align: center; color: #777;">
              This email was sent to <a href="mailto:${customer.email}" style="color: #007BFF;">${customer.email}</a>. If you have any questions, please contact our support team.
            </p>
          </div>`;

        const textMessage = `Welcome ${customer.FirstName} ${customer.LastName}!
We are thrilled to have you with us. Please confirm your registration by visiting the following link:
http://localhost:8000/api/double-opt-in?t=${customer.registrationToken}

If you didn’t request this, please ignore this email.

Thank you,
The Real Deal Team`;

        const subject = "Welcome! Please, validate your account";
        const from = "servicesmicro46@gmail.com";
        const fromLabel = "The Real Deal";
        const to = customer.email;

        try {
          sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
          console.log("Email sent successfully to:", to);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      } else {
        console.log("No message received from queue: customer_created.");
      }
    });



/////////////////////////////////////////


    await amqpService.consumeFromQueue("customer_registrated", (msg) => {
      if (msg) {
        console.log("Message received from queue: customer_registrated");
        const data = JSON.parse(msg.content.toString());
        const user = data.user;
        console.log("Raw message received:", msg.content.toString());
        console.log("Processing customer registration confirmation:", user);

        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <div style="text-align: center;">
              <img src="data:image/png;base64,${imageBase64}" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
            </div>
            <h1 style="text-align: center; color: #007BFF;">Your Registration is Complete!</h1>
            <p>Hi <strong>${user.username}</strong>,</p>
            <p>Congratulations! Your account has been successfully confirmed. You can now access all the features of our platform.</p>
            <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
            <p>Best regards,<br/>The Real Deal Team</p>
          </div>`;

        const textMessage = `Your registration is complete!
Hi ${user.username},
Congratulations! Your account has been successfully confirmed. You can now access all the features of our platform.

Thank you for trusting The Real Deal.

Best regards,
The Real Deal Team`;

        const subject = "Your Registration is Complete";
        const from = "servicesmicro46@gmail.com";
        const fromLabel = "The Real Deal";
        const to = user.email;
        console.log("the email", user.email);

        try {
          sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
          console.log("Confirmation email sent successfully to:", to);
        } catch (error) {
          console.error("Error sending confirmation email:", error);
        }
      } else {
        console.log("No message received from queue: customer_registrated.");
      }
    });

    /////////////////////
    await amqpService.consumeFromQueue("bet_created", (msg) => {
      if (msg) {
        console.log("Message received from queue: bet_created");
        const bet = JSON.parse(msg.content.toString());
        console.log("Processing bet data:", bet);
    
        // Préparer l'email
        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <div style="text-align: center;">
              <img src="${imageSrc}" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
            </div>
            <h1 style="text-align: center; color: #007BFF;">Bet Confirmed!</h1>
            <p>Hi <strong>${bet.username}</strong>,</p>
            <p>Your bet has been successfully placed for the match between <strong>${bet.homeTeam}</strong> and <strong>${bet.awayTeam}</strong>.</p>
            <p>Amount Bet: <strong>$${bet.betAmount}</strong></p>
            <p>Potential Win: <strong>$${bet.potentialWin}</strong></p>
            <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
            <p>Good luck!</p>
            <p>Best regards,<br/>The Real Deal Team</p>
          </div>`;
    
        const textMessage = `Your bet has been confirmed!
    
    Match: ${bet.homeTeam} vs ${bet.awayTeam}
    Amount Bet: $${bet.betAmount}
    Potential Win: $${bet.potentialWin}
    
    Thank you for trusting The Real Deal.
    Good luck!
    Best regards,
    The Real Deal Team`;
    
        const subject = "Bet Confirmation";
        const from = "servicesmicro46@gmail.com";
        const fromLabel = "The Real Deal";
        const to = bet.email || "placeholder@example.com"; // Remplace par l'email réel de l'utilisateur
    
        try {
          sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
          console.log("Bet confirmation email sent successfully to:", to);
        } catch (error) {
          console.error("Error sending bet confirmation email:", error);
        }
      } else {
        console.log("No message received from queue: bet_created.");
      }
    });
    


////////////////////////////
await amqpService.consumeFromQueue("WIN", async (msg) => {
  if (msg) {
    console.log("Message received from queue: WIN");
    const bet = JSON.parse(msg.content.toString());
    console.log("Processing bet win data:", bet);

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h1 style="text-align: center; color: #28a745;">🎉 Congratulations, You Won! 🎉</h1>
        <p>Hi <strong>${bet.username}</strong>,</p>
        <p>Your bet on <strong>${bet.homeTeam} vs ${bet.awayTeam}</strong> has paid off!</p>
        <p><strong>Score:</strong> ${bet.score.home} - ${bet.score.away}</p>
        <p><strong>Selected Outcome:</strong> ${
          bet.selectedOutcome === "1"
            ? bet.homeTeam // Home Team name
            : bet.selectedOutcome === "2"
            ? bet.awayTeam // Away Team name
            : "Draw" // For a draw
        }</p>
        <p><strong>Amount Bet:</strong> $${bet.betAmount}</p>
        <p><strong>Winnings:</strong> $${bet.potentialWin}</p>
        <p>Your updated balance is now <strong>$${bet.updatedBalance}</strong>.</p>
        <p>Thank you for betting with <strong>The Real Deal</strong>. See you for the next match!</p>
        <p style="text-align: center; margin-top: 20px;">
          <a href="https://therealdeal.com" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">Visit Us</a>
        </p>
      </div>`;

    const textMessage = `
Congratulations, You Won!

Hi ${bet.username},

Your bet on ${bet.homeTeam} vs ${bet.awayTeam} has paid off!
Score: ${bet.score.home} - ${bet.score.away}
Selected Outcome: ${
  bet.selectedOutcome === "1"
    ? bet.homeTeam 
    : bet.selectedOutcome === "2"
    ? bet.awayTeam 
    : "Draw" 
}
Amount Bet: $${bet.betAmount}
Winnings: $${bet.potentialWin}
Updated Balance: $${bet.updatedBalance}

Thank you for betting with The Real Deal. See you for the next match!
`;

    const subject = "🎉 You Won! Congratulations!";
    const from = "servicesmicro46@gmail.com";
    const fromLabel = "The Real Deal";
    const to = bet.email || "placeholder@example.com";

    try {
      await sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
      console.log("Win notification email sent successfully to:", to);
    } catch (error) {
      console.error("Error sending win notification email:", error);
    }
  } else {
    console.log("No message received from queue: WIN.");
  }
});

//////////////////////


await amqpService.consumeFromQueue("combinedBet_created", (msg) => {
  if (msg) {
    console.log("Message received from queue: combinedBet_created");

    const combinedBet = JSON.parse(msg.content.toString());
    console.log("Processing combined bet data:", {
      user: combinedBet.userId,
      bets: combinedBet.bets,
      combinedOdd: combinedBet.combinedOdd,
      amount: combinedBet.betAmount,
      potentialWin: combinedBet.potentialWin
    });

    // Préparer l'email
    const betDetailsHtml = combinedBet.bets
      .map(bet => `<li>Match: <strong>${bet.homeTeam}</strong> vs <strong>${bet.awayTeam}</strong>, Outcome: <strong>${bet.selectedOutcome}</strong></li>`)
      .join("");

    const betDetailsText = combinedBet.bets
      .map(bet => `Match: ${bet.homeTeam} vs ${bet.awayTeam}, Outcome: ${bet.selectedOutcome}`)
      .join("\n");

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <div style="text-align: center;">
          <img src="${imageSrc}" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
        </div>
        <h1 style="text-align: center; color: #007BFF;">Combined Bet Confirmed!</h1>
        <p>Hi,</p>
        <p>Your combined bet has been successfully placed with the following details:</p>
        <ul>${betDetailsHtml}</ul>
        <p><strong>Total Odds:</strong> ${combinedBet.combinedOdd}</p>
        <p><strong>Bet Amount:</strong> $${combinedBet.betAmount}</p>
        <p><strong>Potential Win:</strong> $${combinedBet.potentialWin}</p>
        <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
        <p>Good luck!</p>
        <p>Best regards,<br/>The Real Deal Team</p>
      </div>`;

    const textMessage = `Your combined bet has been confirmed!

Bet Details:
${betDetailsText}

Total Odds: ${combinedBet.combinedOdd}
Bet Amount: $${combinedBet.betAmount}
Potential Win: $${combinedBet.potentialWin}

Thank you for trusting The Real Deal.
Good luck!
Best regards,
The Real Deal Team`;

    const subject = "Combined Bet Confirmation";
    const from = "servicesmicro46@gmail.com";
    const fromLabel = "The Real Deal";
    const to = combinedBet.email || "placeholder@example.com"; // Remplace par l'email réel de l'utilisateur

    try {
      sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
      console.log("Combined bet confirmation email sent successfully to:", to);
    } catch (error) {
      console.error("Error sending combined bet confirmation email:", error);
    }
  } else {
    console.log("No message received from queue: bet_combined_created.");
  }
});

////////////////////
await amqpService.consumeFromQueue("Propose", (msg) => {
  if (msg) {
    console.log("Message received from queue: Propose");

    const proposeData = JSON.parse(msg.content.toString());
    console.log("Processing propose data:", proposeData);

    const { users, bookmakerUsername, boostedOdds } = proposeData;

    // Préparer les détails des cotes boostées pour les emails
    const oddsHtml = boostedOdds
      .map(
        (odd) => `
          <li>
            Match: <strong>${odd.homeTeam}</strong> vs <strong>${odd.awayTeam}</strong><br>
            Odds: Home: <strong>${odd.homeOdd}</strong>, Draw: <strong>${odd.drawOdd}</strong>, Away: <strong>${odd.awayOdd}</strong><br>
            Date: <strong>${new Date(odd.date).toLocaleString()}</strong>
          </li>
        `
      )
      .join("");

    const oddsText = boostedOdds
      .map(
        (odd) =>
          `Match: ${odd.homeTeam} vs ${odd.awayTeam}, Odds: Home: ${odd.homeOdd}, Draw: ${odd.drawOdd}, Away: ${odd.awayOdd}, Date: ${new Date(
            odd.date
          ).toLocaleString()}`
      )
      .join("\n");

    // Contenu des emails
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h1 style="text-align: center; color: #007BFF;">Boosted Odds by ${bookmakerUsername}</h1>
        <p>Hi,</p>
        <p>The bookmaker <strong>${bookmakerUsername}</strong> is offering attractive odds on the following matches:</p>
        <ul>${oddsHtml}</ul>
        <p>Place your bets now on these boosted odds before they expire!</p>
        <p>Best regards,<br/><strong>The Real Deal Team</strong></p>
      </div>`;

    const textMessage = `Boosted Odds by ${bookmakerUsername}

The bookmaker ${bookmakerUsername} is offering attractive odds on the following matches:

${oddsText}

Place your bets now on these boosted odds before they expire!

Best regards,
The Real Deal Team`;

    // Envoyer un email à chaque utilisateur
    users.forEach((user) => {
      const subject = "Boosted Odds Available!";
      const to = user.email;
      const from = "servicesmicro46@gmail.com";
      const fromLabel = "The Real Deal";

      try {
        sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
        console.log("Boosted odds email sent successfully to:", to);
      } catch (error) {
        console.error("Error sending boosted odds email to:", to, error.message);
      }
    });

  } else {
    console.log("No message received from queue: Propose.");
  }
});




///////////////////////////////////////////////


await amqpService.consumeFromQueue("Combined_WIN", async (msg) => {
  if (msg) {
    console.log("Message received from queue: Combined_WIN");
    const betData = JSON.parse(msg.content.toString());
    console.log("Processing combined bet win data:", betData);

    const { email, username, potentialWin, updatedBalance, matchDetails } = betData;

    // Debugging: Ensure matchDetails is received
    if (!matchDetails || !Array.isArray(matchDetails) || matchDetails.length === 0) {
      console.error("matchDetails is missing or empty:", matchDetails);
      return;
    }

    // Debugging: Ensure email is received
    if (!email) {
      console.error("Email is missing in betData:", betData);
      return;
    }

    // Construct match list for HTML email
    const matchListHTML = matchDetails
      .map(
        (match) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${match.homeTeam} vs ${match.awayTeam}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${match.date || "Unknown Date"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            match.score ? `${match.score.home} - ${match.score.away}` : "Score Not Available"
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            match.selectedOutcome === "1"
              ? match.homeTeam
              : match.selectedOutcome === "2"
              ? match.awayTeam
              : "Draw"
          }</td>
        </tr>`
      )
      .join("");

    // Construct match list for plain text email
    const matchListText = matchDetails
      .map(
        (match) =>
          `- ${match.homeTeam} vs ${match.awayTeam} | Date: ${match.date || "Unknown Date"} | Score: ${
            match.score ? `${match.score.home} - ${match.score.away}` : "N/A"
          } | Your Pick: ${
            match.selectedOutcome === "1" ? match.homeTeam : match.selectedOutcome === "2" ? match.awayTeam : "Draw"
          }`
      )
      .join("\n");

    // HTML email content
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
      <h1 style="text-align: center; color: #28a745;">Congratulations, You Won!</h1>
      <p>Hi <strong>${username}</strong>,</p>
      <p>Your combined bet was successful! Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f8f8;">Match</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f8f8;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f8f8;">Score</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f8f8;">Your Pick</th>
          </tr>
        </thead>
        <tbody>
          ${matchListHTML}
        </tbody>
      </table>
      <p><strong>Total Winnings:</strong> $${potentialWin}</p>
      <p>Your updated balance is now <strong>$${updatedBalance}</strong>.</p>
      <p>Thank you for betting with <strong>The Real Deal</strong>. See you for the next match!</p>
      <p style="text-align: center; margin-top: 20px;">
        <a href="https://therealdeal.com" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">Visit Us</a>
      </p>
    </div>`;

    // Plain text email content
    const textMessage = `
Congratulations, You Won!

Hi ${username},

Your combined bet was successful! Here are the details:

${matchListText}

Total Winnings: $${potentialWin}
Updated Balance: $${updatedBalance}

Thank you for betting with The Real Deal. See you for the next match!`;

    const subject = "Congratulations! You Won!";
    const from = "servicesmicro46@gmail.com";
    const fromLabel = "The Real Deal";
    const to = email || "placeholder@example.com";

    try {
      console.log("Sending email to:", to);
      await sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
      console.log("Combined bet win notification email sent successfully to:", to);
    } catch (error) {
      console.error("Error sending combined bet win notification email:", error);
    }
  } else {
    console.log("No message received from queue: Combined_WIN.");
  }
});





//////////////////


await amqpService.consumeFromQueue("payement_sucess", async (msg) => {
  if (msg) {
    console.log("Message received from queue: payement_sucess");
    const payment = JSON.parse(msg.content.toString());
    console.log("Processing payment success data:", payment);

    // Construire le message d'email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <div style="text-align: center;">
          <img src="https://yourcompany.com/logo.png" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
        </div>
        <h1 style="text-align: center; color: #28a745;">💳 Payment Successful!</h1>
        <p>Hi <strong>${payment.username}</strong>,</p>
        <p>Your payment of <strong>${payment.amount}€</strong> has been successfully processed.</p>
        <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
        <p><strong>Transaction Date:</strong> ${new Date(payment.transactionDate).toLocaleString()}</p>
        <p>Your new balance is <strong>${payment.newBalance}€</strong>.</p>
        <p>Thank you for using <strong>The Real Deal</strong>.</p>
        <p style="text-align: center; margin-top: 20px;">
          <a href="https://therealdeal.com" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">View Account</a>
        </p>
      </div>`;

    const textMessage = `
Payment Successful!

Hi ${payment.username},

Your payment of ${payment.amount}€ has been successfully processed.

Transaction ID: ${payment.transactionId}
Transaction Date: ${new Date(payment.transactionDate).toLocaleString()}
New Balance: ${payment.newBalance}€

Thank you for using The Real Deal.
`;

    const subject = "💳 Payment Successful - The Real Deal";
    const from = "servicesmicro46@gmail.com";
    const fromLabel = "The Real Deal";
    const to = payment.email;

    try {
      await sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
      console.log("Payment success email sent successfully to:", to);
    } catch (error) {
      console.error("Error sending payment success email:", error);
    }
  } else {
    console.log("No message received from queue: payement_sucess.");
  }
});

////////////////////////////////


  } catch (error) {
    console.error("Error during RabbitMQ connection or consumption:", error);
  }
};

(async () => {
  console.log("Starting Notification Service...");
  await readFromQueue();
})();
