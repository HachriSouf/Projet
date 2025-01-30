const express = require("express");
const axios = require("axios");
const Customer = require('../models/Customer');
const User = require('../models/User');
const AMQPService = require("../AMQPService/AMQPService");
const { adminMiddleware } = require("../middleware/checkAuthorization");

const router = express.Router();

const authService = axios.create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const customerService = axios.create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const bookmakerService = axios.create({
  baseURL: "http://trd_project-bookmaker-service-1:4004",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const sendCustomerCreatedMessageToQueue = async (customer) => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    await amqpService.sendToQueue("customer_created", JSON.stringify(customer));
    console.log("Message sent to queue: customer_created");
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error.message);
  } finally {
    setTimeout(async () => {
      await amqpService.close(); 
    }, 5000);
  }
};

const sendCustomerRegistratedMessageToQueue = async (user) => {
  const amqpService = new AMQPService(
    `amqp://${process.env.MESSAGE_BROKER_USER}:${process.env.MESSAGE_BROKER_PASSWORD}@${process.env.MESSAGE_BROKER}`
  );

  try {
    await amqpService.connect();
    await amqpService.sendToQueue("customer_registrated", JSON.stringify(user));
    console.log("Message sent to queue: customer_registrated");
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error.message);
  } finally {
    setTimeout(async () => {
      await amqpService.close(); 
    }, 5000);
  }
};

router.post('/bookmaker',adminMiddleware, async (req, res) => {
  try {
    const { username, password, firstname, lastname, email, Number } = req.body;

    if (!username || !password || !firstname || !lastname || !email || !Number) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log('Making request to auth service for bookmaker...');
    const user = { username, password, email, role: 1 }; 
    const authResponse = await authService.post('/auth/register', user);

    const USER_ID = authResponse.data.userId;
    console.log('User ID from auth service:', USER_ID);

    console.log('Making request to bookmaker service...');
    const bookmakerData = {
      user_id: USER_ID,
      username,
      FirstName: firstname,
      LastName: lastname,
      Number,
      email,
    };

    const bookmakerResponse = await bookmakerService.post('/bookmaker/create', bookmakerData);

    res.status(201).json({
      message: 'Bookmaker created successfully',
      authResponse: authResponse.data,
      bookmakerResponse: bookmakerResponse.data,
    });
  } catch (error) {
    console.error('Error occurred while creating bookmaker:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/sign-up", async (req, res) => {
  try {
    const { username, password, firstname, lastname, email, Number } = req.body;

    if (!username || !password || !firstname || !lastname || !email || !Number) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = { username, password, email };
    console.log("Making request to auth service...");
    const authResponse = await authService.post("/auth/register", user);
    const registrationToken = authResponse.data.registrationToken;
    const USER_ID = authResponse.data.userId;
    console.log("user_id :" ,USER_ID);
    const customerData = new Customer({
      user_id : USER_ID,
      username,
      FirstName: firstname,
      LastName: lastname,
      Number,
      email,
      registrationToken, 
    });

    console.log("Making request to customer service...");
    const customerResponse = await customerService.post("/customer/createCustomer", customerData);

    await sendCustomerCreatedMessageToQueue(customerData);

    res.status(201).json({
      message: "User signed up successfully",
      authResponse: authResponse.data,
      customerResponse: customerResponse.data,
      othermessage: customerData,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/double-opt-in", async (req, res) => {
  const { t: registrationToken } = req.query;
  
  console.log("Query parameters:", req.query);
  console.log("Extracted registrationToken:", registrationToken);

  if (!registrationToken) {
    return res.status(400).json({ message: "Registration token is required." });
  }

  try {
    console.log("Making request to auth service for double opt-in...");
    const authResponse = await authService.get(`/auth/double-opt-in?t=${registrationToken}`);

    const user = authResponse.data.user;

    await sendCustomerRegistratedMessageToQueue({user});

    res.status(200).json({
      message: "Account successfully confirmed.",
      user,
    });
  } catch (error) {
    console.error("Error during double opt-in:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const resultat = await authService.post("/auth/login", req.body, {
      headers: { Authorization: req.header("Authorization") }, 
    });

    return res.json(resultat.data);

  } catch (error) {
    console.error("Error occurred:", error.message);

    if (error.response) {
      console.log("Error response data:", error.response.data);
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.post("/sign-out", async (req, res) => {
  try {
    const resultat = await authService.post("/auth/logout", req.body, {
      headers: { Authorization: req.header("Authorization") }, 
    });
    console.log(resultat.data);
    return res.json(resultat.data);

  } catch (error) {
    console.error("Error occurred:", error.message);

    if (error.response) {
      console.log("Error response data:", error.response.data);
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const verifyResult = await authService.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` }, 
    });

    res.status(200).json(verifyResult.data);
  } catch (error) {
    console.error("Error during token verification:", error.message);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Error verifying token with auth service.",
      });
    }

    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const userResult = await authService.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }, 
    });

    res.status(200).json(userResult.data);
  } catch (error) {
    console.error("Error in /me endpoint:", error.message);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Error in auth service.",
      });
    }

    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

router.delete("/delete", async (req, res) => {
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1]; 
  if (!token) {
      return res.status(401).json({ message: "No token provided" }); 
  }

  try {
      const authResponse = await authService.delete("/auth/delete", {
          headers: { Authorization: `Bearer ${token}` }, 
          data: req.body, 
      });

      const custResponse = await customerService.delete("/customer/delete-customer", {
          headers: { Authorization: `Bearer ${token}` }, 
          data: req.body, 
      });

     
      return res.status(200).json({
          message: "User and customer deleted successfully",
          authService: authResponse.data,
          customerService: custResponse.data,
      });
  } catch (error) {
      console.error("Error during deletion:", error);

      if (error.response) {
          return res.status(error.response.status).json({
              message: "Error from service",
              details: error.response.data,
          });
      }

      return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/healthcheck",adminMiddleware , async (req, res) => {
  try
  { 
  const promises = 
  [ 
  authService.get("/"),
  customerService.get("/")
  ]; 

await Promise.all(promises);

return res.status(201).json({ message: "It's all right !" });
}
catch(err){
  console.error(err);
  res.status(500).json({ message: 'Services didnt start !' });
}
});




module.exports = router;

