// 0724 ver

const express = require('express');
const router = express.Router();
const { getAllElderlyUsers, addElderlyUser, addGuardianUser, getAllGuardianUsers } = require('../controllers/userController');

// 노인 사용자 회원 조회
router.get('/elderly', getAllElderlyUsers);
// 노인 사용자 회원 가입
router.post('/elderly/register', addElderlyUser);

// 보호자 회원 조회
router.get('/guardian', getAllGuardianUsers);
// 보호자 회원 가입
router.post('/guardian/register', addGuardianUser);

module.exports = router;
