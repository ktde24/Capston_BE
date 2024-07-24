// 0722 ver

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

// ElderlyUser 조회
const getAllElderlyUsers=asyncHandler(async(req,res)=>{
  const result=await ElderlyUser.findAll();
  res.send(result);
});

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

// GuardianUser 조회
const getAllGuardianUsers=asyncHandler(async(req,res)=>{
  const result=await GuardianUser.findAll();
  res.send(result);
});

// GuardianUser 가입
const addGuardianUser = asyncHandler(async (req, res) => {
  const { id, name, password,email,phone,address, birth,job,existingConditions,elderlyPhone,elderlyAddress} = req.body;

  // id 중복 여부 확인
  const existingId = await GuardianUser.findOne({ id: id});
  if (existingId) {
    return res.status(400).json({ error: '존재하는 ID입니다.' });
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 사용자 생성
  const guardian = await GuardianUser.create({
    id,
    name,
    password: hashedPassword,
    email,
    phone,
    address, 
    birth,
    job,
    existingConditions,
    elderlyPhone,
    elderlyAddress,
  });

  res.status(201).json({
    message: '회원가입 완료',
    guardian
  });
});

module.exports = { getAllElderlyUsers,addElderlyUser, addGuardianUser,getAllGuardianUsers };
