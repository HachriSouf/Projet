const express = require('express');
const axios = require('axios');
const AMQPService = require("../AMQPService/AMQPService");
const router = express.Router();


const authService = axios.create({
  baseURL: "http://trd_project-auth-service-1:3000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
// Création d'une instance d'axios pour interagir avec le service de paiement
const paymentService = axios.create({
  baseURL: "http://trd_project-payement-service-1:4001", // L'URL du service de paiement
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Route pour traiter un paiement
router.post("/process-payment", async (req, res) => {
  try {
    // Envoyer directement les données de la requête au service de paiement
    const result = await paymentService.post("/payement/process-payment", req.body, {
      headers: { Authorization: req.header("Authorization") },
    });

    // Retourner la réponse du service de paiement au client
    return res.json(result.data);

  } catch (error) {
    console.error("Error occurred:", error.message);

    // Gérer les erreurs retournées par le service de paiement
    if (error.response) {
      console.log("Error response data:", error.response.data);
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    }

    // Gérer les erreurs internes du serveur
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
