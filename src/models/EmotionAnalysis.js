// 0805 ver(감정분석용)
const mongoose = require('mongoose');

const EmotionAnalysisSchema = new mongoose.Schema({
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
    emotions: {
      type: Map,
      of: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const EmotionAnalysis = mongoose.model('EmotionAnalysis', EmotionAnalysisSchema);
  module.exports = EmotionAnalysis;