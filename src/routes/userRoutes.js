// 0722 ver

const express = require('express');
const router = express.Router();
const { getAllElderlyUsers, addElderlyUser,addGuardianUser,getAllGuardianUsers } = require('../controllers/userController');

// 회원 조회
router.get('/', getAllElderlyUsers);
// 회원 가입
router.post('/register', addElderlyUser);

// 보호자 조회
router.get('/guardian',getAllGuardianUsers);

// 보호자 회원가입
router.post('/guardian/register')

module.exports = router;