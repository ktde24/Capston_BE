// 0805 ver
const mongoose = require('mongoose');

const now = new Date();

const DiarySchema = new mongoose.Schema({
  diaryId: {
    type: String,
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
  messages:{ //자녀에게 하고 싶은 말
    type:String,
    required:true,
  },
  conditions:{ //몸 상태
    type:String,
    required:true,
  }
});

const Diary = mongoose.model('Diary', DiarySchema);
module.exports = Diary;