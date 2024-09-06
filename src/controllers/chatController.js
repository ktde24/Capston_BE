// 0807 ver(대화, 세션 관리)
// JSON 응답과 Binary 데이터를 별도로 전송하여 클라이언트에서 이를 각각 처리할 수 있도록

const { callChatgpt} = require('../utils/chatgpt');
const { speechToText } = require('../utils/stt');
const { textToSpeechConvert } = require('../utils/tts');
const ElderlyUser = require('../models/ElderlyUser');
const ChatSession = require('../models/ChatSession');
const { v4: uuidv4 } = require('uuid');

exports.handleWebSocketMessage = async (ws, message) => {
  try {
    if (message.toString().startsWith('{')) {
      const data = JSON.parse(message);
      const { userId, sessionId } = data;

      ws.userId = userId;
      ws.sessionId = sessionId;

      const user = await ElderlyUser.findById(userId);
      if (!user) {
        ws.send(JSON.stringify({ type: 'error', message: '사용자를 찾을 수 없습니다.' }));
        return;
      }

      // 세션 ID가 없는 경우 새로 생성
      if (!sessionId) {
        ws.sessionId = uuidv4();
      }
    } else if (Buffer.isBuffer(message)) {
      const { userId, sessionId } = ws;
      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: '사용자 ID가 설정되지 않았습니다.' }));
        return;
      }

      const audioBuffer = message;
      const userText = await speechToText(audioBuffer);

      // 대화 세션 찾기 또는 생성
      let chatSession = await ChatSession.findOne({ userId: userId, sessionId: sessionId });
      if (!chatSession) {
        chatSession = new ChatSession({ userId: userId, sessionId: sessionId, messages: [] });
      }
      chatSession.messages.push({ role: 'user', content: userText, timestamp: new Date() });

      const conversations = chatSession.messages;
      const gptResponse = await callChatgpt(conversations);

      let audioContent;
      if (gptResponse) {
        audioContent = await textToSpeechConvert(gptResponse);
      }

      chatSession.messages.push({ role: 'assistant', content: gptResponse, timestamp: new Date() });
      await chatSession.save();

      // JSON 응답 전송
      ws.send(JSON.stringify({ type: 'response', userText, gptText: gptResponse, sessionId }));

      // Binary 응답 전송
      if (audioContent) {
        ws.send(audioContent); // audioContent를 binary 형식으로 전송
      }
    }
  } catch (error) {
    console.error('에러 발생:', error);
    ws.send(JSON.stringify({ type: 'error', message: '처리 실패: ' + error.message }));
  }
};
