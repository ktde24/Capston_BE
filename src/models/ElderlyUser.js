// 0725 ver (노인 사용자 회원가입 시 받아올 정보 수정 - 보호자 전화번호 받기, 보호자 Id 삭제, 노인 생년월일삭제)
// 보호자가 없는 노인 사용자는 존재하지 않음
const mongoose = require('mongoose');

const ElderlyUserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
    autoIncrement: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  guardianPhone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "elderly"
  }
});

const ElderlyUser = mongoose.model('ElderlyUser', ElderlyUserSchema);
module.exports = ElderlyUser;
