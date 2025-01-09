const express = require('express');
const { register, login , verify, logout, me, deleteUser} = require('../controller/authController');

const router = express.Router();

router.post('/logout',logout);
router.post('/register', register);
router.post('/login', login);
router.get('/verify',verify);
router.get('/me',me);
router.delete('/delete',deleteUser);


module.exports = router;