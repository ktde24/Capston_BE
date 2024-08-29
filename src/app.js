// 0829 - middleware 추가
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { protect } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const sttRoutes = require('./routes/sttRoutes');
const chatRoutes = require('./routes/chatRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const emotionAnalysisRoutes = require('./routes/emotionAnalysisRoutes');
const chatController = require('./controllers/chatController');
const memoryScoreRoutes = require('./routes/memoryScoreRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/auth', protect, authRoutes);
app.use('/api/assessments', protect,assessmentRoutes);
app.use('/api/chat', protect,chatRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/diary', protect, diaryRoutes);
app.use('/api/emotion-analysis', protect, emotionAnalysisRoutes);
app.use('/api/memoryscore', protect, memoryScoreRoutes);
app.use('/api/reports', protect, reportRoutes);

// 공통 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: '오류 발생' });
});

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
