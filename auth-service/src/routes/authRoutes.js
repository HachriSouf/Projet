const express = require('express');
const { getUserEmailById,register, login , verify, logout, me, deleteUser, doubleOptIn} = require('../controller/authController');

const router = express.Router();

router.post('/logout',logout);
router.post('/register', register);
router.post('/login', login);
router.get('/verify',verify);
router.get('/me',me);
router.delete('/delete',deleteUser);
router.get('/double-opt-in',doubleOptIn);
router.get('/user/:id', getUserEmailById);



module.exports = router;