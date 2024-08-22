// 0814 ver
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  diaryId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diary',
    required: true
  },
  date: { 
    type: Date,
    required: true
  },
  messages: { 
    type: String, // 자녀에게 전하고 싶은 말
    required: true
  },
  cdrScore: { // 기억 점수
    type: Number,
    required: true
  },
  memoryScoreId: { // MemoryScore의 _id 저장
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryScore',
    required: true
  },
  emotions: {
    type: Map,
    of: Number, // 감정 분석 결과
    required: true
  },
  conditions: { 
    type: String, // 건강 상태
    required: true
  },
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
