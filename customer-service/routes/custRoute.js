const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustController'); // Path to your controller

router.post('/createCustomer', customerController.createCustomer);
router.delete('/delete-customer', customerController.deleteCustomer);
router.get('/all-customers', customerController.findAllCustomers);
router.get('/:username', customerController.findCustomerByUsername);
router.put('/:username', customerController.updateCustomerByUsername);
router.delete('/soft-delete/:username', customerController.softDeleteCustomer);

module.exports = router;