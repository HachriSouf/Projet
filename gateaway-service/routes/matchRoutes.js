const express = require("express");
const axios = require("axios");

const router = express.Router();

const matchService = axios.create({
  baseURL: "http://trd_project-match-service-1:4007",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

router.post("/", async (req, res) => {
  try {
    const resultat = await matchService.post("/matches", req.body, {
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

router.get("/", async (req, res) => {
  try {
    const resultat = await matchService.get("/matches", {
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

router.post("/start/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await matchService.post(`/matches/start/${id}`, req.body, {
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

// Récupérer un match par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await matchService.get(`/matches/${id}`, {
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
