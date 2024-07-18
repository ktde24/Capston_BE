// 0718 ver
const mongoose = require('mongoose'); // MongoDB와 상호 작용하기 위한 ODM 라이브러리
require('dotenv').config();

const uri = process.env.MONGODB_URI; // .env 파일에 정의된 MONGODB_URI 환경변수 가져오기

const connectDB = async () => {
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
