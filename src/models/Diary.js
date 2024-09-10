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
  messageToChild: {
    type: String,
    required: false
  },
  healthStatus: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now 
  }
});

const Diary = mongoose.model('Diary', DiarySchema);
module.exports = Diary;
