const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const multer = require('multer'); // 파일 처리
const { protect } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const sttRoutes = require('./routes/sttRoutes');
//const chatRoutes = require('./routes/chatRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const emotionAnalysisRoutes = require('./routes/emotionAnalysisRoutes');
const memoryScoreRoutes = require('./routes/memoryScoreRoutes');
const reportRoutes = require('./routes/reportRoutes');

// 일기 생성 챗봇과 기억 점수 측정 챗봇을 위한 컨트롤러
//const { startDiaryChatBot } = require('./controllers/chatController'); // 일기 생성 챗봇
const { startWebSocketServer } = require('./controllers/memoryScoreController'); // 기억 점수 측정 챗봇

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// message.html 실행 테스트
app.use(express.static("public"));

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessments', protect, assessmentRoutes);
//app.use('/api/chat', protect, chatRoutes); // 일기 생성 챗봇 라우트
app.use('/api/tts', ttsRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/diary', protect, diaryRoutes);
app.use('/api/emotion-analysis', protect, emotionAnalysisRoutes);
app.use('/api/findmemoryscore', protect, memoryScoreRoutes); // 기억 점수 조회 라우트
app.use('/api/reports', protect, reportRoutes);

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성(기억점수용) 및 연결 설정
startWebSocketServer(server);


// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

module.exports = app;