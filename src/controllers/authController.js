// 0722 ver
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

// JWT 생성
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // 만료 기간 
  });
};

// 노인 사용자 로그인
const loginElderlyUser = asyncHandler(async (req, res) => {
    const { id, password } = req.body;
  
    const user = await GuardianUser.findOne({ id });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, // MongoDB에서 사용되는 ObjectId
        id: user.id,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
  });

// 보호자 로그인
const loginGuardianUser = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  const user = await ElderlyUser.findOne({ id });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id, // MongoDB에서 사용되는 ObjectId
      id: user.id,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }
});

module.exports = { loginElderlyUser, loginGuardianUser };