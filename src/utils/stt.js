// 0726 ver
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const clientId = process.env.NAVER_CLIENT_ID;
const clientSecret = process.env.NAVER_CLIENT_SECRET;

async function speechToText(audioFilePath) {
  const lang = "Kor";
  const url = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=" + lang;
  const audioData = fs.readFileSync(audioFilePath);

  try {
    const response = await axios.post(url, audioData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
    });
    return response.data.text;
  } catch (error) {
    console.error('STT 변환 실패:', error.response ? error.response.data : error.message);
    throw new Error('STT 변환 실패');
  }
}

module.exports = { speechToText };
