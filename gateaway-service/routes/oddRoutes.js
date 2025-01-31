const express = require("express");
const axios = require("axios");

const router = express.Router();

const oddService = axios.create({
  baseURL: "http://trd_project-odd-service-1:4005",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Mettre à jour les cotes d'un match
router.put("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const resultat = await oddService.put(`/odds/${matchId}`, req.body, {
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

// Booster les cotes d'un match
router.patch("/boost/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const resultat = await oddService.patch(`/odds/boost/${matchId}`, req.body, {
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

// Annuler le boost des cotes d'un match
router.patch("/deboost/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const resultat = await oddService.patch(`/odds/deboost/${matchId}`, {
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

// Envoyer les cotes boostées aux utilisateurs
router.get("/propose", async (req, res) => {
  try {
    const resultat = await oddService.get("/odds/propose", {
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

// Récupérer les cotes d'un match spécifique
router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const resultat = await oddService.get(`/odds/${matchId}`, {
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

router.delete("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const resultat = await oddService.delete(`/odds/${matchId}`, {
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