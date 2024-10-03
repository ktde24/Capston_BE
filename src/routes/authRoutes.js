const express = require('express');
const router = express.Router();
const { loginUser} = require('../controllers/authController');

// 로그인(노인, 보호자 모두)
router.post('/login',loginUser);

module.exports = router;
