// 0720 ver
const mongoose = require('mongoose'); // MongoDB와 상호 작용하기 위한 ODM 라이브러리
require('dotenv').config();

const uri = process.env.MONGODB_URI; // .env 파일에 정의된 MONGODB_URI 환경변수 가져오기

const connectDB = async () => {
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    
    // 커넥션 이벤트
    mongoose.connection.on('connected', () => {
      console.log('DB 연결 성공');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`DB 연결 실패: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('DB disconnected');
    });
  } catch (err) {
    console.error('DB 연결 실패:', err);
    process.exit(1);
  }
};

// 프로세스가 종료될 때(ctrl+C) Mongoose 커넥션을 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed(앱 종료됨)');
  process.exit(0);
});

module.exports = connectDB;