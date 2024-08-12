// 0812 ver
// 자가진단 결과

const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },  // 노인 사용자의 ID
  guardianId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 보호자의 ID
  questionnaireType: { 
    type: String, 
    enum: ['KDSQ', 'PRMQ'], 
    required: true 
  },
  score: { type: Number, required: true },
  date: { type: Date, required: true },
}, {
  timestamps: true
});

const Assessment = mongoose.model('Assessment', AssessmentSchema);

module.exports = Assessment;
