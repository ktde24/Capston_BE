// 0725 ver (노인이 입력한 본인 이름과 보호자의 전화번호가 보호자가 입력한 사항과 일치한 경우에만 노인 회원가입 가능)

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

// ElderlyUser 조회
const getAllElderlyUsers = asyncHandler(async (req, res) => {
  try {
    const users = await ElderlyUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '사용자 조회에 실패했습니다.' });
  }
});
// ElderlyUser 가입
const addElderlyUser = asyncHandler(async (req, res) => {
  const { id, password, name, guardianPhone } = req.body;

  // guardianPhone이 유효한지 확인하고, 보호자가 입력한 노인 이름과 일치하는지 확인
  const guardian = await GuardianUser.findOne({ phone: guardianPhone, elderlyName: name });
  if (!guardian) {
    return res.status(400).json({ message: '유효하지 않은 보호자 전화번호이거나 노인 사용자의 이름이 보호자 정보와 일치하지 않습니다.' });
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 사용자 생성
  const user = await ElderlyUser.create({
    id,
    password: hashedPassword,
    name,
    guardianPhone
  });

  res.status(201).json({
    message: '회원가입 완료',
    user
  });
});


// GuardianUser 조회
const getGuardianById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const guardian = await GuardianUser.findOne({ id });
  if (guardian) {
    res.json(guardian);
  } else {
    res.status(404).json({ message: '보호자를 찾을 수 없습니다.' });
  }
});

// GuardianUser 전체 조회
const getAllGuardianUsers = asyncHandler(async (req, res) => {
  try {
    const guardians = await GuardianUser.find();
    res.status(200).json(guardians);
  } catch (error) {
    res.status(500).json({ message: '보호자 조회에 실패했습니다.' });
  }
});


// GuardianUser 가입
const addGuardianUser = asyncHandler(async (req, res) => {
  const { id, name, password, email, phone, address, birth, job, existingConditions, elderlyName, elderlyPhone, elderlyAddress } = req.body;

  // id 중복 여부 확인
  const existingId = await GuardianUser.findOne({ id });
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
    elderlyName,
    elderlyPhone,
    elderlyAddress,
  });

  res.status(201).json({
    message: '회원가입 완료',
    guardian
  });
});

module.exports = { getAllElderlyUsers, addElderlyUser, addGuardianUser, getAllGuardianUsers };
