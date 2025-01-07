const express = require("express");
const axios = require("axios");

const router = express.Router();

const AUTH_SERVICE_URL = "http://auth-service:3000"; 
const CUSTOMER_SERVICE_URL = "http://customer-service:5000";

const sendCustomerCreatedMessageToQueue = async (customer) => {
  console.log("Sending customer created message to queue:", customer);
  
};

router.post("/sign-up", async (req, res, next) => {
  try {
    const { username, password, firstname, lastname } = req.body;

    const customer = {
      firstname,
      lastname,
      username,
      password,
    };

    // Call the Auth Service
    const signUpResult = await axios.post(
      `${AUTH_SERVICE_URL}/sign-up`,
      customer,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const { id, registrationToken } = signUpResult.data; // Extract account ID and registration token

    customer.id = id;
    customer.registrationToken = registrationToken;
    delete customer.password; // Remove password before sending to other services

    // Call the Customer Service
    await axios.post(`${CUSTOMER_SERVICE_URL}/customers`, customer, {
      headers: { Authorization: req.headers.authorization },
    });

    // Send a message to the message queue
    await sendCustomerCreatedMessageToQueue(customer);

    // Respond with the Auth Service result
    return res.status(201).json(signUpResult.data).set("Location", signUpResult.headers.location);
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        message: error.response?.data || "An error occurred in external service communication.",
      });
    }
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

module.exports = router;
