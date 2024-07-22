// 0722 ver

const express = require('express');
const router = express.Router();
const { getAllElderlyUsers, addElderlyUser } = require('../controllers/userController');

// 회원 조회
router.get('/', getAllElderlyUsers);
// 회원 가입
router.post('/register', addElderlyUser);

module.exports = router;
