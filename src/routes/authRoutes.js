const express = require('express');
const router = express.Router();
const { loginElderlyUser, loginGuardianUser } = require('../controllers/authController');

// 노인 사용자 로그인
router.post('/elderly/login', loginElderlyUser);

// 보호자 사용자 로그인
router.post('/guardian/login', loginGuardianUser);

module.exports = router;
