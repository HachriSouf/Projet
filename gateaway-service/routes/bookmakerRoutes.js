const express = require("express");
const axios = require("axios");

const router = express.Router();

const bookmakerService = axios.create({
  baseURL: "http://trd_project-bookmaker-service-1:4004",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Créer un bookmaker
router.post("/", async (req, res) => {
  try {
    const resultat = await bookmakerService.post("/bookmaker", req.body, {
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

// Mettre à jour un bookmaker
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await bookmakerService.put(`/bookmaker/${id}`, req.body, {
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

// Récupérer tous les bookmakers
router.get("/", async (req, res) => {
  try {
    const resultat = await bookmakerService.get("/bookmaker", {
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

// Récupérer un bookmaker par ID utilisateur
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const resultat = await bookmakerService.get(`/bookmaker/${user_id}`, {
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

// Supprimer un bookmaker
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await bookmakerService.delete(`/bookmaker/${id}`, {
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

module.exports = router;