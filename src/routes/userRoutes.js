<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const {getAllElderlyUsers,addElderlyUser} = require('../controllers/userController');

//회원조회
router.get('/',getAllElderlyUsers);
//회원가입
router.post('/', addElderlyUser);

module.exports = router;
=======
// 0722 ver

const express = require('express');
const router = express.Router();
const { getAllElderlyUsers, addElderlyUser } = require('../controllers/userController');

// 회원 조회
router.get('/', getAllElderlyUsers);
// 회원 가입
router.post('/register', addElderlyUser);

module.exports = router;
>>>>>>> fbd29afa30bfa4b316a571a6ddb713b641c76523
