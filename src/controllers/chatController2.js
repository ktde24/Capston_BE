// stt, tts 사용하지 않고 텍스트로 대화하기 위한 컨트롤러(API 키 발급받기 전 임시용)
// chatController의 역할: 대화 관리, 일기 생성, 세션 관리
const asyncHandler = require('express-async-handler');
const { callChatgpt, generateDiary } = require('../utils/chatgpt');
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
        chatSession = new ChatSession({ userId: userId, sessionId: new mongoose.Types.ObjectId(), messages: [] });
      }
  
      // 메시지 추가
      chatSession.messages.push({ role: 'user', content: message });
      await chatSession.save();
  
      // ChatGPT 호출
      const gptResponse = await callChatgpt(chatSession.messages);
      chatSession.messages.push({ role: 'assistant', content: gptResponse });
      await chatSession.save();
  
      // 대화 종료 여부 확인
      if (message.includes("종료") || message.includes("대화 끝")) {
        // 일기 생성
        const diaryData = await generateDiary(chatSession.messages);
  
        // 새로운 일기 생성 및 저장
        if (diaryData) {
          const newDiary = new Diary({
            userId: userId,
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
      console.error(error);
      res.status(500).json({ error: '오류 발생' });
    }
  });