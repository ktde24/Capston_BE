const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: {
    type: Number,
    unique: true,
    autoIncrement: true
  },
  userId: { // 확인 필요
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  diaryId: { // 일기 id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diary',
    required: true
  },
  date: { 
    type: Date,
    default: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  },
  messages:{ 
    type: Schema.Types.ObjectId,
    ref: 'Diary',
    required: true
  },
  cdrScore:{// 기억 점수
    type: Schema.Types.ObjectId,
    ref: 'MemoryScore',
    required: true
  },
  emotions:{ //감정 분석
    type: Schema.Types.ObjectId,
    ref: 'EmotionAnalysis', // 감정분석 참조
    required: true
  },   
  conditions:{ //몸 상태
    type: Schema.Types.ObjectId,
    ref: 'Diary',
    required: true
  },
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;