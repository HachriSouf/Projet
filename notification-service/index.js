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
            <p>Hi <strong>${bet.userId}</strong>,</p>
            <p>Your bet has been successfully placed for the match between <strong>${bet.matchId}</strong>.</p>
            <p>Amount Bet: <strong>$${bet.betAmount}</strong></p>
            <p>Potential Win: <strong>$${bet.potentialWin}</strong></p>
            <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
            <p>Good luck!</p>
            <p>Best regards,<br/>The Real Deal Team</p>
          </div>`;

        const textMessage = `Your bet has been confirmed!
Hi ${bet.userId},
Your bet has been successfully placed for the match ${bet.matchId}.

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
  ////////////////////  
  await amqpService.consumeFromQueue("payement_sucess", async (msg) => {
    if (msg) {
      console.log("Message received from queue: payement_sucess");
      const payment = JSON.parse(msg.content.toString());
      console.log("Processing payment data:", payment);

      // Préparer l'email
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <div style="text-align: center;">
          <img src="data:image/png;base64,${imageBase64}" alt="Logo" style="width: 100px; margin-bottom: 20px;" />
            <h1 style="color: #28a745;">Payment Successful!</h1>
            <p>Hi <strong>${payment.userId}</strong>,</p>
            <p>Your payment of <strong>€${payment.amount}</strong> has been processed successfully.</p>
            <p>Your new balance is: <strong>€${payment.newBalance}</strong>.</p>
            <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
            <p>Best regards,<br/>The Real Deal Team</p>
          </div>
        </div>`;

      const textMessage = `Payment Successful!
        Hi ${payment.userId},

          Your payment of €${payment.amount} has been processed successfully.
          Your new balance is: €${payment.newBalance}.

          Thank you for trusting The Real Deal.

          Best regards,
          The Real Deal Team`;

      const subject = "Payment Confirmation";
      const from = "servicesmicro46@gmail.com";
      const fromLabel = "The Real Deal";
      const to = payment.email || "placeholder@example.com"; 

      try {
        await sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
        console.log("Payment confirmation email sent successfully to:", to);
      } catch (error) {
        console.error("Error sending payment confirmation email:", error);
      }
    } else {
      console.log("No message received from queue: payement_Sucess.");
    }
  });


////////////////////////////
await amqpService.consumeFromQueue("WIN", async (msg) => {
  if (msg) {
    console.log("Message received from queue: WIN");
    const bet = JSON.parse(msg.content.toString());
    console.log("Processing bet win data:", bet);

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h1 style="text-align: center; color: #28a745;">Congratulations, You Won!</h1>
        <p>Hi <strong>${bet.email}</strong>,</p>
        <p>Your bet on the match <strong>${bet.matchId}</strong> has been successful!</p>
        <p>Amount Bet: <strong>$${bet.betAmount}</strong></p>
        <p>Potential Win: <strong>$${bet.potentialWin}</strong></p>
        <p>Thank you for trusting <strong>The Real Deal</strong>.</p>
        <p>Best regards,<br/>The Real Deal Team</p>
      </div>`;

    const textMessage = `Congratulations, You Won!
Hi ${bet.email},

Your bet on the match ${bet.matchId} has been successful!

Amount Bet: $${bet.betAmount}
Potential Win: $${bet.potentialWin}
Your new Balance: $${bet.updatedBalance}

Thank you for trusting The Real Deal.

Best regards,
The Real Deal Team`;

    const subject = "Congratulations, You Won!";
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

  } catch (error) {
    console.error("Error during RabbitMQ connection or consumption:", error);
  }
};

(async () => {
  console.log("Starting Notification Service...");
  await readFromQueue();
})();
