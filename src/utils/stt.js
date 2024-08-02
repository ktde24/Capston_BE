// 0729 ver
const axios = require('axios');
require('dotenv').config();

const clientId = process.env.NAVER_CLIENT_ID;
const clientSecret = process.env.NAVER_CLIENT_SECRET;

async function speechToText(audioBuffer) {
  const lang = "Kor";
  const url = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=" + lang;

  try {
    const response = await axios.post(url, audioBuffer, {
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

