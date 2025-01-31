const express = require("express");
const axios = require("axios");

const router = express.Router();

const betService = axios.create({
  baseURL: "http://trd_project-betting-service-1:4000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Créer un pari simple
router.post("/", async (req, res) => {
  try {
    const resultat = await betService.post("/bet/createBet", req.body, {
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

// Créer un pari combiné
router.post("/combined", async (req, res) => {
  try {
    const resultat = await betService.post("/bet/createCombinedBet", req.body, {
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

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await betService.put(`/bet/${id}`, req.body, {
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

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await betService.get(`/bet/${id}`, {
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

router.get("/user", async (req, res) => {
  try {
    const resultat = await betService.get("/bet/user", {
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

router.put("/bet/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await betService.put(`/bet/bet/${id}`, req.body, {
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultat = await betService.delete(`/bet/${id}`, {
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