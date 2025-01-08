const express = require("express");
const axios = require("axios");
const Customer = require('../models/Customer');
const User = require('../models/User');

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

router.post("/sign-up", async (req, res) => {
  try {
    const { username, password, firstname, lastname, email, Number} = req.body;

    // Log incoming request body
    console.log("Incoming request data:", req.body);

    if (!username) console.log("Missing username");
if (!password) console.log("Missing password");
if (!firstname) console.log("Missing firstname");
if (!lastname) console.log("Missing lastname");
if (!email) console.log("Missing email");
if (!Number) console.log("Missing Number");

    // Validate required fields
    if (!username || !password || !firstname || !lastname || !email || !Number) {
      console.log("Missing fields in request body");
      return res.status(400).json({ error: "All fields are required." });
    }

    // Log the validated data before creating the customer
    console.log("Validated data:", { username, password, firstname, lastname, email ,Number});

    // Create customer and user data
    const customerData = new Customer({
      username,
      FirstName: firstname,
      LastName: lastname,
      Number,
    });

    const user = new User({
      username,
      password,
      email,
      refreshToken: null, // Will be populated later when user logs in
    });


    // Make request to the auth service
    console.log("Making request to auth service...");
    const authResponse = await authService.post("/auth/register", user);

    // Log response from the auth service
    console.log("Auth service response:", authResponse.data);

    // Make request to the customer service
    console.log("Making request to customer service...");
    const customerResponse = await customerService.post("/customer/createCustomer", customerData);

    // Log response from the customer service
    console.log("Customer service response:", customerResponse.data);

    // Send successful response
    res.status(201).json({
      message: "User signed up successfully",
      authResponse: authResponse.data,
      customerResponse: customerResponse.data
    });
  } catch (error) {
    console.error("Error occurred:", error.message);

    // Log error details for debugging
    if (error.response) {
      console.log("Error response data:", error.response.data);
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
      headers: { Authorization: req.header("Authorization") }, // Header facultatif
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




router.get("/healthcheck", async (req, res) => {
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

