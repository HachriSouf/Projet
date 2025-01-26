const amqplib = require("amqplib");

class AMQPService {
  constructor(url) {
    this.url = url; 
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqplib.connect(this.url);
      console.log("AMQP connection established");

      this.channel = await this.connection.createChannel();
      console.log("AMQP channel created");
    } catch (error) {
      console.error("Failed to connect to AMQP broker:", error);
      throw error;
    }
  }

  async sendToQueue(queue, message) {
    try {
      if (!this.channel) {
        throw new Error("Channel is not initialized");
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(message));
      console.log(`Message sent to queue "${queue}":`, message);
    } catch (error) {
      console.error("Error sending message to queue:", error);
    }
  }

  // Consommation des messages d'une queue
  async consumeFromQueue(queue, onMessage) {
    try {
      if (!this.channel) {
        throw new Error("Channel is not initialized");
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.channel.consume(queue, (msg) => {
        if (msg) {
          console.log(
            `Message received from queue "${queue}": ${msg.content.toString()}`
          );
          onMessage(msg);
          this.channel.ack(msg); // Confirmation du traitement du message
        }
      });
    } catch (error) {
      console.error("Error consuming messages from queue:", error);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log("AMQP connection closed");
    } catch (error) {
      console.error("Error closing AMQP connection:", error);
    }
  }
}

module.exports = AMQPService;
