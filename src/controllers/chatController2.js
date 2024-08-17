// 0816ver - stt, tts 사용하지 않고 텍스트로 대화하기 위한 컨트롤러(TTS API 키 발급받기 전 임시 사용)
// chatController의 역할: 대화 관리, 일기 생성, 세션 관리
const asyncHandler = require('express-async-handler');
const { callChatgpt, generateDiary } = require('../utils/gptService');
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

exports.handleChat = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const message = req.body.message;

  try {
      // 사용자와 세션을 찾거나 생성
      let chatSession = await ChatSession.findOne({ userId: userId });
      if (!chatSession) {
          chatSession = new ChatSession({
              userId: userId,
              sessionId: new mongoose.Types.ObjectId().toString(), // sessionId는 String 타입이므로 toString 사용
              messages: []
          });
      }

      // 메시지 추가 전에 content가 존재하는지 확인
      if (!message || typeof message !== 'string' || !message.trim()) {
          console.error('유효하지 않은 사용자 메시지:', message);
          return res.status(400).json({ error: '유효하지 않은 메시지입니다.' });
      }

      chatSession.messages.push({ role: 'user', content: message });
      await chatSession.save();

      // ChatGPT 호출
      const gptResponse = await callChatgpt(chatSession.messages);

      // GPT 응답 검증
      if (gptResponse && typeof gptResponse === 'string' && gptResponse.trim()) {
        chatSession.messages.push({ role: 'assistant', content: gptResponse });
        await chatSession.save();
    } else {
        console.error('유효하지 않은 GPT 응답:', gptResponse);
        return res.status(500).json({ error: 'GPT 응답이 유효하지 않습니다.' });
    }
    


      // 대화 종료 여부 확인
      if (message.includes("종료") || message.includes("대화 끝")) {
          // 일기 생성
          const diaryData = await generateDiary(chatSession.messages);

          // 새로운 일기 생성 및 저장
          if (diaryData) {
              const newDiary = new Diary({
                  userId: userId,
                  diaryId: new mongoose.Types.ObjectId(), // 명시적으로 고유한 diaryId 생성
                  content: diaryData.diary,
                  messageToChild: diaryData.messageToChild,
                  healthStatus: diaryData.healthStatus
              });
              await newDiary.save();
          }

          res.json({ message: "대화가 종료되었습니다. 일기가 생성되었습니다.", diaryData });
      } else {
          res.json({ gptResponse });
      }
  } catch (error) {
      console.error('채팅 처리 중 오류 발생:', error);
      res.status(500).json({ error: '오류 발생' });
  }
});