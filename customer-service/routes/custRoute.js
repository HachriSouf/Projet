const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustController'); 

router.post('/createCustomer', customerController.createCustomer);
router.delete('/delete-customer', customerController.deleteCustomerByUserId);
router.get('/all-customers', customerController.findAllCustomers);
router.get('/:user_id', customerController.findCustomerByUserId);
router.put('/:user_id', customerController.updateCustomerByUserId);
router.delete('/soft-delete/:user_id', customerController.softDeleteCustomerByUserId);

module.exports = router;
