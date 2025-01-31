const express = require('express');
const { deleteBet,updateBet,getBetsByUser,getBetById,createBet,createCombinedBet,updateCombinedBet } = require('../controller/betController');

const router = express.Router();

router.post('/createBet',createBet);
router.post('/createCombinedBet',createCombinedBet);
router.put('/:id',updateCombinedBet);

router.get('/:id', getBetById);
router.get('/user', getBetsByUser);
router.put('/bet/:id', updateBet);
router.delete('/:id', deleteBet);

module.exports = router;