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
  guardianId: { // 확인 필요
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuardianUser',
    required: true
  },
  date: { 
    type: Date,
    default: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  },
  condition:{
    type:String,
    required:true,
  },
  mainEmotion:{
    type:String,
    required:true,
  },
  emotionAnalysisTop3:{
    type:String,
    required:true,
  },
  dailyMemoryScore:{
    type:int,
    required:true,
  },
  weeklyMemoryScore:{
    type:int,
    required:true,
  },
  messageToGuardian:{
    type:Text,
    required:true,
  },
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;