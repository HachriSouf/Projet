const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/checkAuthorization");

const router = express.Router();

// Configuration du service Customer
const customerService = axios.create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Créer un client
router.post("/createCustomer", authMiddleware, async (req, res) => {
  try {
    const response = await customerService.post("/customer/createCustomer", req.body, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to create customer" });
  }
});

// Récupérer tous les clients
router.get("/all-customers", authMiddleware, async (req, res) => {
  try {
    const response = await customerService.get("/customer/all-customers", {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error fetching customers:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to fetch customers" });
  }
});

// Trouver un client par username
router.get("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const response = await customerService.get(`/customer/${username}`, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error fetching customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to fetch customer" });
  }
});

// Mettre à jour un client par username
router.put("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const response = await customerService.put(`/${username}`, req.body, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to update customer" });
  }
});

// Suppression douce d'un client par username
router.delete("/soft-delete/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const response = await customerService.delete(`/customer/soft-delete/${username}`, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error during soft delete:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to soft delete customer" });
  }
});

// Supprimer un client
router.delete("/delete-customer", authMiddleware, async (req, res) => {
  try {
    const response = await customerService.delete("/customer/delete-customer", {
      data: req.body,
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error deleting customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to delete customer" });
  }
});

module.exports = router;