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
  const request = {
    input: { text: text },
    voice: { languageCode: 'ko-KR', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent; // 파일에 저장하지 않고 바로 반환
  //const writeFile = util.promisify(fs.writeFile);
  //await writeFile('output.mp3', response.audioContent, 'binary');
  //console.log('Audio content written to file: output.mp3');
}

module.exports = { textToSpeechConvert };
