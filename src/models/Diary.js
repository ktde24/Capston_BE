const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  diaryId: {
    type: Number,
    unique: true,
    autoIncrement: true
  },
  userId: { // 확인 필요
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  date: { 
    type: Date,
    default: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  },
  content: { 
    type: String,
    required: true,
  },
});

const Diary = mongoose.model('Diary', DiarySchema);
module.exports = Diary;