// 0722 ver

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

// ElderlyUser 가입
const addElderlyUser = asyncHandler(async (req, res) => {
  const { id, password, name, birth, guardianUserId } = req.body;

  // guardianUserId가 유효한지 확인
  const guardian = await GuardianUser.findOne({ id: guardianUserId });
  if (!guardian) {
    return res.status(400).json({ message: '유효하지 않은 보호자 ID입니다.' });
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 사용자 생성
  const user = await ElderlyUser.create({
    id,
    password: hashedPassword,
    name,
    birth,
    guardianId: guardian._id,
  });

  res.status(201).json({
    message: '회원가입 완료',
    user
  });
});

module.exports = { addElderlyUser };
