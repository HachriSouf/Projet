const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustController'); // Path to your controller

router.post('/createCustomer', customerController.createCustomer);
router.delete('/delete-customer', customerController.deleteCustomer);
module.exports = router;