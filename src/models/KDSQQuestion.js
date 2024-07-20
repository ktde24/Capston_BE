// 0720 ver
const mongoose = require('mongoose');

// KDSQQuestion 스키마 정의
const kdsqQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true }, // 질문 텍스트
    option0: { type: String, required: true }, // 0점 옵션 텍스트
    option1: { type: String, required: true }, // 1점
    option2: { type: String, required: true }, // 2점
  });

module.exports = mongoose.model('KDSQQuestion', kdsqQuestionSchema);