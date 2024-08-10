// 0805 ver
const mongoose = require('mongoose');

const now = new Date();

const MemoryScoreSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  date: { //기억 점수 테스트 하는 날 
    type: Date,
    default: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  },
  diaryIds:[{ //일기 Id 리스트
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diary',
    required:true
  }],
  questionCnt: {//전체 질문 개수 
    type: Number,
    required: true,
  },
  hintCnt: { //사용한 힌트 개수
    type: Number,
    required: true,
  },
  correctCnt: { //질문 중 정답 개수
    type: Number,
    required: true,
  },
  cdrScore: {
    type: Number,
    required: true,
  },
});

const MemoryScore = mongoose.model('MemoryScore', MemoryScoreSchema);
module.exports = MemoryScore;