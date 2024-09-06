// 0829ver - JWT 토큰에서 userId 추출하도록
// stt, tts 사용하지 않고 텍스트로 대화하기 위한 컨트롤러(TTS API 키 발급받기 전 임시 사용)
// chatController의 역할: 대화 관리, 일기 생성, 세션 관리
const asyncHandler = require('express-async-handler');
const { callChatgpt, generateDiary } = require('../utils/gptService');
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// 세션 만료 확인 함수 작성
function isSessionExpired(createdAt) {
    const today = new Date();
    return (
        createdAt.getUTCFullYear() !== today.getUTCFullYear() ||
        createdAt.getUTCMonth() !== today.getUTCMonth() ||
        createdAt.getUTCDate() !== today.getUTCDate()
    );
}

const handleChat = asyncHandler(async (req, res) => {
    const userId = req.user._id; // JWT 토큰에서 추출한 userId
    const message = req.body.message;
  
    try {
        // 사용자와 세션을 찾거나 생성
        let chatSession = await ChatSession.findOne({ userId });

        // 세션이 존재하고 하루가 지났는지 확인
        if (chatSession && isSessionExpired(chatSession.createdAt)) {
            // 세션이 만료되었으면 새로운 세션 생성
            chatSession = null;
        }
  
        if (!chatSession) {
            chatSession = new ChatSession({
                userId: userId,
                sessionId: new mongoose.Types.ObjectId().toString(), // sessionId는 String 타입이므로 toString 사용
                messages: [
                    { role: 'assistant', content: '안녕하세요! 저는 소담이에요! 오늘 어떤 하루를 보내셨나요?' } // 초기 메시지 추가
                ]
            });
            await chatSession.save();
        } else if (message && typeof message === 'string' && message.trim()) {
            // 메시지가 유효한 경우에만 기존 세션에 새 메시지를 추가
            chatSession.messages.push({ role: 'user', content: message });
            await chatSession.save();
        } else {
            console.error('유효하지 않은 사용자 메시지:', message);
            return res.status(400).json({ error: '유효하지 않은 메시지입니다.' });
        }
  
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
        if (message && typeof message === 'string' && (message.includes("종료") || message.includes("대화 끝"))) {
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

module.exports = { handleChat }; 
