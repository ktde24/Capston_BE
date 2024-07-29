// 0725 ver
const { textToSpeechConvert } = require('../utils/tts');

const startTTS = async (req, res) => {
  const { text } = req.body; // 클라이언트로부터 받은 텍스트 데이터
  try {
    const audioContent = await textToSpeechConvert(text); // 텍스트를 음성으로 변환
    res.status(200).json({ message: 'TTS 변환 성공', audioContent }); // 성공 시 변환된 음성을 클라이언트에 전달
  } catch (error) {
    res.status(500).json({ message: '변환을 실패하였습니다.', error: error.message }); // 실패 시 에러 메시지 전달
  }
};

module.exports = { startTTS };

