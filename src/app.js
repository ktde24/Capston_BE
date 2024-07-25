// 0725 ver
// 실시간 음성 대화하려면 WebSocket 필요한 듯 -> Postman은 WebSocket API 테스트를 지원X

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { textToSpeechConvert } = require('./utils/tts');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const ttsRoutes = require('./routes/ttsRoutes');

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(express.json());

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/tts', ttsRoutes);

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성 및 연결 설정
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const text = message.toString();
    try {
      const audioContent = await textToSpeechConvert(text);
      ws.send(audioContent);
    } catch (error) {
      ws.send(JSON.stringify({ error: '음성 변환 실패: ' + error.message }));
    }
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