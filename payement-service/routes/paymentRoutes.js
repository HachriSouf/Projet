const express = require('express');
const PaymentController = require('../controllers/paymentcontroller');

const router = express.Router();

// Route pour vérifier que le service de paiement fonctionne
router.get('/', (req, res) => {
  res.send({ message: 'Payment service is up and running!' });
});

// Route pour traiter un paiement
router.post('/process-payment', PaymentController.processPayment);

module.exports = router;
