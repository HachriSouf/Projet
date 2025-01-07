const express = require("express");
const axios = require("axios");


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