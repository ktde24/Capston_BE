const textToSpeech = require('@google-cloud/text-to-speech');
//const fs = require('fs');
//const util = require('util');
require('dotenv').config();

// Google Cloud TTS 클라이언트 설정
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

// 텍스트를 음성으로 변환하는 함수
async function textToSpeechConvert(text) {
  console.log("TTS 변환 시작. 변환할 텍스트:", text);  // TTS 호출 확인

  const request = {
    input: { text: text },
    voice: { languageCode: 'ko-KR', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    console.log("TTS 변환 성공, 음성 데이터 크기:", response.audioContent.length); // 변환된 음성의 크기를 로그로 확인
    
    // Base64로 변환된 음성을 Buffer로 변환
    const audioBuffer = Buffer.from(response.audioContent, 'base64');
    return audioBuffer; // Buffer로 반환
  } catch (error) {
    console.error("TTS 변환 중 오류 발생:", error);
    throw new Error("TTS 변환 실패");
  }
}

module.exports = { textToSpeechConvert };
