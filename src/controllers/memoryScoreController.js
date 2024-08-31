// 0826ver(일한 날짜에 동일한 사용자가 두 번 이상 기억 점수를 생성하지 못하도록)

const asyncHandler = require('express-async-handler');
const { memoryTest, calculateCdrScore } = require('../utils/memoryScoreService');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');
const MemoryScore = require('../models/MemoryScore');
const Diary = require('../models/Diary');

// 기억 테스트 시작
const startMemoryTest = asyncHandler(async (req, res) => {
    const userId = req.user._id;  // JWT 토큰에서 추출한 userId
    const userMessage = req.body.message || "시작";
  
    let conversations = req.body.conversations || [{ role: "user", content: userMessage }];
    let today = new Date();
    today.setHours(0, 0, 0, 0);
  
    try {
        const user = req.user;  // 미리 인증된 사용자 정보 사용
  
        const existingMemoryScore = await MemoryScore.findOne({
            userId: user._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        });
  
        if (existingMemoryScore) return res.status(400).json({ message: '오늘의 기억 점수는 이미 생성되었습니다.' });
  
        const diaryList = [];
        for (let i = 3; i > 0; i--) {
            let targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);
            let startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            let endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
            let diary = await Diary.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
            if (diary) diaryList.push(diary);
        }
  
        if (diaryList.length === 0) return res.status(404).json({ message: '최근 3일 동안의 일기를 찾을 수 없습니다.' });
  
        const response = await memoryTest({
            elderlyName: user.name,
            guardianPhone: user.guardianPhone,
            address: req.user.address,
            birth: req.user.birth,
            job: req.user.job
        }, diaryList, conversations);
  
        if (!response || response.error) return res.status(500).json({ error: 'ChatGPT API로부터 응답을 받지 못했습니다.' });
  
        if (response.content) {
            const responseText = response.content.trim();
            conversations.push({ role: "assistant", content: responseText });
  
            const isLastQuestion = responseText.includes("마지막 질문");
  
            if (isLastQuestion) {
                const questionCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes("질문")).length;
                const correctCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes('정답')).length;
                const hintCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes('힌트')).length;
  
                const cdrScore = calculateCdrScore(questionCnt, correctCnt, hintCnt);
  
                const memoryScore = new MemoryScore({
                    userId: user._id,
                    cdrScore: cdrScore,
                    correctCnt: correctCnt,
                    hintCnt: hintCnt,
                    questionCnt: questionCnt,
                    conversations: conversations,
                    date: today,
                });
  
                await memoryScore.save();
  
                return res.status(200).json({ conversations, cdrScore, nextAction: "기억 테스트가 완료되었습니다." });
            } else {
                return res.status(200).json({ conversations, nextAction: "사용자의 응답을 기다리고 있습니다." });
            }
        } else {
            return res.status(500).json({ error: 'Unexpected API response structure' });
        }
    } catch (error) {
        console.error('기억 테스트 중 오류 발생:', error);
        res.status(500).json({ message: '기억 테스트를 실패했습니다.', error: error.message });
    }
  });
  
  // 사용자 id 또는 보호자 id로 기억 점수 전체 조회
  const getAllMemoryScores = asyncHandler(async (req, res) => {
    const userId = req.user._id;  // JWT 토큰에서 추출한 userId
  
    try {
        const scores = await MemoryScore.find({ userId });
  
        if (!scores || !scores.length) {
            return res.status(404).json({ message: '기억 테스트 내역이 없습니다.' });
        }
  
        res.status(200).json(scores);
  
    } catch (error) {
        console.error('기억 점수 전체 조회 중 오류 발생:', error);
        res.status(500).json({ message: '기억 점수 전체 조회에 실패했습니다.', error: error.message });
    }
  });
  
  module.exports = { startMemoryTest, getAllMemoryScores };