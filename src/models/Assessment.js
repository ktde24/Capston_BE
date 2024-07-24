// 0720 ver
// 자가진단 결과

const mongoose = require('mongoose');

// Assessment 스키마 정의
const assessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ElderlyUser', required: true }, // 노인 사용자 ID (외래 키)
    guardianId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuardianUser', required: false }, // 보호자 ID (외래 키, 선택 사항)
    questionnaireType: { type: String, enum: ['KDSQ', 'PRMQ'], required: true }, // 설문지 유형
    answers: { type: Array, required: true }, // 자가진단 답변 배열
    score: { type: Number, required: true }, // 자가진단 점수
    date: { type: Date, default: Date.now } // 자가진단 날짜 및 시간
  });
  
  module.exports = mongoose.model('Assessment', assessmentSchema);