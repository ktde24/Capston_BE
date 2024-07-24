// MongoDB 연결 테스트용 코드(0718 ver)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const testDBConnection = async () => {
  await connectDB();
  mongoose.connection.close()
    .then(() => {
      console.log('MongoDB connection closed');
    })
    .catch(err => {
      console.error('Error closing MongoDB connection:', err);
    });
};

testDBConnection();
