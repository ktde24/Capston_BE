const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!uri) {
    console.error('MONGODB_URI가 정의되지 않았습니다.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB 연결');
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose 연결!');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose 연결 에러: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose 연결 실패');
    });
  } catch (err) {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
