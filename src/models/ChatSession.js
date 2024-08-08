// timestamp 수정 - 세션 자체의 생성 및 업데이트 시간 기록(0807ver)
const mongoose = require('mongoose');

// MessageSchema: 개별 메시지 구조 정의
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [MessageSchema] // MessageSchema를 사용하여 messages 배열 정의
}, {
  timestamps: true // 생성 및 업데이트 타임스탬프 추가
});

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
module.exports = ChatSession;
