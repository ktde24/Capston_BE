// 0721 ver
const mongoose = require('mongoose');

const ElderlyUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthday: { 
    type: Date,
    required: true,
  },
  existingConditions: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: true
  },
  guardianId: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId로 수정
    ref: 'GuardianUser', // GuardianUser 모델의 ObjectId를 참조
    required: false // 보호자가 없는 경우가 있을 수 있음
  },
  role: {
    type: String,
    default: "elderly"
  }
});

const ElderlyUser = mongoose.model('ElderlyUser', ElderlyUserSchema);
module.exports = ElderlyUser;
