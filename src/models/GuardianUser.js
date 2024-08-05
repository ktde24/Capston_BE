const mongoose = require('mongoose');
// 0805 수정
// API Test 중에 MongoDB에서 중복된 키 오류 발생하여 수정(자동 증가 필드를 쉽게 추가할 수 있는 플러그인)
const AutoIncrement = require('mongoose-sequence')(mongoose); // guardianId 필드를 자동 증가 필드로 설정

const GuardianUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  birth: { 
    type: Date,
    required: true,
  },
  job: { 
    type: String,
    required: true,
  },
  existingConditions: { 
    type: String,
    required: true,
  },
  elderlyName: {
    type: String,
    required: true,
  },
  elderlyPhone: { 
    type: String,
    required: true,
  },
  elderlyAddress: {
    type: String,
    required: true
  },
  elderlyBirthday: { 
    type: Date,
    required: true,
  },
  role: {
    type: String,
    default: "guardian"
  }
});

// 플러그인을 스키마에 적용하고 자동 증가 필드를 지정
GuardianUserSchema.plugin(AutoIncrement, { inc_field: 'guardianId' });

const GuardianUser = mongoose.model('GuardianUser', GuardianUserSchema);
module.exports = GuardianUser;