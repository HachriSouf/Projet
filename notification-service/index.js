const AMQPService = require("./Services/AMQPService");
const sendMail = require("./Services/MailService");

const MESSAGE_BROKER = process.env.MESSAGE_BROKER;
const MESSAGE_BROKER_USER = process.env.MESSAGE_BROKER_USER;
const MESSAGE_BROKER_PASSWORD = process.env.MESSAGE_BROKER_PASSWORD;

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

        const htmlMessage = `<p>Welcome ${customer.FirstName} ${customer.LastName} !<br>Please, <a href='http://localhost:8000/api/double-opt-in?t=${customer.registrationToken}'>visit this link to confirm your registration</a></p>`;
        const textMessage = `Welcome ${customer.FirstName} ${customer.LastName} ! Please, visit http://localhost:8000/api/double-opt-in?t=${customer.registrationToken} to confirm your registration.`;
        const subject = "Welcome! Please, validate your account";
        const from = "servicesmicro46@gmail.com";
        const fromLabel = "The_Real_Deal";
        const to = customer.email;

        try {
          sendMail(textMessage, htmlMessage, subject, to, from, fromLabel);
          console.log("Email sent successfully to:", to);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      } else {
        console.log("No message received from queue.");
      }
    });
  } catch (error) {
    console.error("Error during RabbitMQ connection or consumption:", error);
  }
};

(async () => {
  console.log("Starting Notification Service...");
  await readFromQueue();
})();
