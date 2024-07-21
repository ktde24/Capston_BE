// 0721 ver

const express = require('express');
const router = express.Router();
const {getAllElderlyUsers,addElderlyUser} = require('../controllers/userController');

//회원조회
router.get('/',getAllElderlyUsers);
//회원가입
router.post('/', addElderlyUser);

module.exports = router;