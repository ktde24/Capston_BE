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

// 로그인(보호자, 사용자)
const loginUser = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  try {
    //노인, 보호자 확인
    const elderlyUser = await ElderlyUser.findOne({ id:id });
    const guardianUser = await GuardianUser.findOne({ id:id });

    //노인 사용자
    if(elderlyUser){
      if (await bcrypt.compare(password, elderlyUser.password)) {
      res.json({
        _id: elderlyUser._id,
        id: elderlyUser.id,
        token: generateToken(elderlyUser._id),
        isElderly: true,
      });
    } else {
      res
        .status(401)
        .json({ message: "사용자님의 아이디 또는 비밀번호가 올바르지 않습니다." });
    }
      return;
    }

    //보호자 사용자
    if(guardianUser){
      if (await bcrypt.compare(password, guardianUser.password)) {
      res.json({
        _id: guardianUser._id,
        id: guardianUser.id,
        token: generateToken(guardianUser._id),
        isElderly: false,
      });
    } else {
      res
        .status(401)
        .json({ message: "사용자님의 아이디 또는 비밀번호가 올바르지 않습니다." });
    }
      return;
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = { loginUser };
