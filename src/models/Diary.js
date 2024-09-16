// 0816 ver
const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  diaryId: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId, // 자동으로 고유한 ObjectId 생성
    unique: true // 중복을 허용하지 않음
  },
  content: {
    type: String,
    required: true
  },
  healthStatus: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now 
  },
  // 감정 분석 참조 추가
  emotionAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmotionAnalysis',
  },
  // 리포트 참조 추가
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  },
});

const Diary = mongoose.model('Diary', DiarySchema);
module.exports = Diary;
