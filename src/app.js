// 0722 ver

const express = require('express');
// const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // 데이터베이스 연결 설정 파일
const userRoutes = require('./routes/userRoutes'); 
const authRoutes = require('./routes/authRoutes');  // 인증 라우터
const assessmentRoutes = require('./routes/assessmentRoutes'); 

const chatRoutes = require('./routes/chatRoutes'); //대화(chatgpt api) 라우터
//const cookieParser = require('cookie-parser');

//const expressLayouts=require("express-ejs-layouts");//ejs

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(express.json());
//app.use(cookieParser()); 
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// 라우터 설정
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chat', chatRoutes); //대화

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server 실행 중 ${PORT}`);
});

module.exports = app;
