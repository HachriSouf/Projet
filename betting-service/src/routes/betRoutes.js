const express = require('express');
const { createBet,createCombinedBet,updateCombinedBet } = require('../controller/betController');

const router = express.Router();

router.post('/createBet',createBet);
router.post('/createCombinedBet',createCombinedBet);
router.put('/:id',updateCombinedBet);

// router.get('/:id', getBetById);
// router.get('/user', getBetsByUser);
// router.put('/:id', updateBet);
// router.delete('/:id', deleteBet);

module.exports = router;