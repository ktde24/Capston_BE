// 0721 ver

const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // 데이터베이스 연결 설정 파일
const userRoutes = require('./routes/userRoutes'); 
const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우터 설정
app.use('/elderly-users', userRoutes);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server 실행 중 ${PORT}`);
});

module.exports = app;
