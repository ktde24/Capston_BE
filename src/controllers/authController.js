// 0722 ver
// JWT 토큰 생성 & 반환
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ElderlyUser = require("../models/ElderlyUser");
const GuardianUser = require("../models/GuardianUser");

// JWT 생성
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // 만료 기간
  });
};

// 노인 사용자 로그인
const loginElderlyUser = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await ElderlyUser.findOne({ id });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        id: user.id,
        token: generateToken(user._id),
      });
    } else {
      res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 보호자 로그인
const loginGuardianUser = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await GuardianUser.findOne({ id });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        id: user.id,
        token: generateToken(user._id),
      });
    } else {
      res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }
  } catch (error) {
    console.error(error); // 에러 로그 출력
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = { loginElderlyUser, loginGuardianUser };
