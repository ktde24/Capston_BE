// 0721 ver

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const ElderlyUser = require('../models/ElderlyUser'); // 모델 경로 확인

// ElderlyUser 전체 조회
const getAllElderlyUsers = asyncHandler(async (req, res) => {
  const result = await ElderlyUser.find();
  res.send(result);
});

// ElderlyUser 가입
const addElderlyUser = asyncHandler(async (req, res) => {
  const { name, password, birthday, existingConditions, phone, guardianId } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 사용자 생성
  const user = await ElderlyUser.create({
    name,
    password: hashedPassword,
    birthday,
    existingConditions,
    phone,
    guardianId,
  });

  res.status(201).json({
    message: '회원가입 완료',
    user
  });
});

module.exports = { getAllElderlyUsers, addElderlyUser };
