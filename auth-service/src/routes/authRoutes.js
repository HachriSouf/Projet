const express = require('express');
const { register, login , verify, logout, me} = require('../controller/authController');

const router = express.Router();

router.post('/logout',logout);
router.post('/register', register);
router.post('/login', login);
router.get('/verify',verify);
router.get('/me',me);

module.exports = router;