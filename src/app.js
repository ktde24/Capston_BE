// 0805(감정분석 요청 추가)
// 실시간 음성 대화하려면 WebSocket 필요한 듯 -> Postman은 WebSocket API 테스트를 지원X
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const sttRoutes = require('./routes/sttRoutes');
const chatRoutes = require('./routes/chatRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const emotionAnalysisRoutes = require('./routes/emotionAnalysisRoutes'); // 추가된 라우터
const memoryScoreRoutes=require('./routes/memoryScoreRoutes');
const chatController = require('./controllers/chatController');


const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/emotion-analysis', emotionAnalysisRoutes); // 새로운 감정 분석 라우터 추가
app.use('/api/memoryscore',memoryScoreRoutes);

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성 및 연결 설정
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    chatController.handleWebSocketMessage(ws, message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server 실행 중 ${PORT}`);
});

module.exports = app;
