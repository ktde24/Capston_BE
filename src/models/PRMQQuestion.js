// 0720 ver
const mongoose = require('mongoose');

// PRMQ 질문 스키마 정의
const prmqQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true }, // 질문 텍스트
    options: [
      { type: String, required: true }, // 1점 옵션
      { type: String, required: true }, // 2점 옵션
      { type: String, required: true }, // 3점 옵션
      { type: String, required: true }, // 4점 옵션
      { type: String, required: true }, // 5점 옵션
    ],
  });

// PRMQQuestion 모델 생성 및 내보내기
module.exports = mongoose.model('PRMQQuestion', prmqQuestionSchema);