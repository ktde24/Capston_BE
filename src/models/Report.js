// 0813 ver
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ReportSchema = new mongoose.Schema({
  reportId: {
    type: Number,
    unique: true
  },
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
    default: Date.now,
  },
  messages: { 
    type: String,
    required: true
  },
  cdrScore: { 
    type: Number,
    required: true
  },
  memoryScoreId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryScore',
    required: true
  },
  emotions: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmotionAnalysis', 
    required: true
  },   
  conditions: { 
    type: String,
    required: true
  },
});

// reportId 필드 자동 증가 설정
ReportSchema.plugin(AutoIncrement, { inc_field: 'reportId' });

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
