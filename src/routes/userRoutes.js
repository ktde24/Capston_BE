// 0831 - id 중복 체크 추가

const express = require('express');
const router = express.Router();
const { getAllElderlyUsers, addElderlyUser, addGuardianUser, getAllGuardianUsers, checkIdAvailability } = require('../controllers/userController');

// 사용자 아이디 중복 확인
router.get('/check-id/:id', checkIdAvailability);

// 노인 사용자 회원 조회
router.get('/elderly', getAllElderlyUsers);
// 노인 사용자 회원 가입
router.post('/elderly/register', addElderlyUser);

// 보호자 회원 조회
router.get('/guardian', getAllGuardianUsers);
// 보호자 회원 가입
router.post('/guardian/register', addGuardianUser);

module.exports = router;
