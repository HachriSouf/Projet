const express = require("express");
const axios = require("axios");
const { adminMiddleware } = require("../middleware/checkAuthorization");

const router = express.Router();

const customerService = axios.create({
  baseURL: "http://trd_project-customer-service-1:5000",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

router.post("/createCustomer", adminMiddleware, async (req, res) => {
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

router.get("/all-customers", adminMiddleware, async (req, res) => {
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

router.get("/:user_id", adminMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;

    const response = await customerService.get(`/customer/${user_id}`, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error fetching customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to fetch customer" });
  }
});

router.put("/:user_id", adminMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;

    const response = await customerService.put(`/customer/${user_id}`, req.body, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating customer:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to update customer" });
  }
});

router.delete("/soft-delete/:user_id", adminMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;

    const response = await customerService.delete(`/customer/soft-delete/${user_id}`, {
      headers: { Authorization: req.header("Authorization") },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error during soft delete:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: "Failed to soft delete customer" });
  }
});

router.delete("/delete-customer", adminMiddleware, async (req, res) => {
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

