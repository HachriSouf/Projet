const express = require('express');
const { createBet } = require('../controller/betController');

const router = express.Router();

router.post('/createBet',createBet);
// router.get('/:id', getBetById);
// router.get('/user', getBetsByUser);
// router.put('/:id', updateBet);
// router.delete('/:id', deleteBet);

module.exports = router;