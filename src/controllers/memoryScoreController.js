// 0908ver

const asyncHandler = require('express-async-handler');
const { memoryTest, calculateCdrScore } = require('../utils/memoryScoreService');
const ElderlyUser = require('../models/ElderlyUser');
const MemoryScore = require('../models/MemoryScore');
const Diary = require('../models/Diary');
const GuardianUser = require('../models/GuardianUser');

// 서버에서 기억 테스트 세션을 관리하기 위한 구조 
let userConversations = {}; // 사용자별로 conversations를 관리하는 객체

// 기억 테스트 시작
const startMemoryTest = asyncHandler(async (req, res) => {
    const userId = req.user._id;  // JWT 토큰에서 추출한 userId
    const userMessage = req.body.message || '';  // 사용자가 보낸 메시지
    let today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜 설정

    if (!userConversations[userId]) {
        userConversations[userId] = [];
    }

    let conversations = userConversations[userId]; // 해당 사용자의 대화 상태

    try {
        const user = await ElderlyUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const guardian = await GuardianUser.findOne({ phone: user.guardianPhone });
        if (!guardian) {
            return res.status(404).json({ message: '보호자를 찾을 수 없습니다.' });
        }

        const userInfo = {
            elderlyName: user.name,
            guardianPhone: guardian.phone,
            address: guardian.address,
            birth: guardian.birth,
            job: guardian.job,
        };

        const existingMemoryScore = await MemoryScore.findOne({
            userId: user._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        });

        if (existingMemoryScore) {
            return res.status(400).json({ message: '오늘의 기억 점수는 이미 생성되었습니다.' });
        }

        if (conversations.length === 0) {
            const botGreeting = "안녕하세요! 소담이에요, 이제 기억 점수 측정을 시작해볼까요?";
            conversations.push({ role: "assistant", content: botGreeting });
            return res.status(200).json({
                conversations,
                nextAction: "사용자의 응답을 기다리고 있습니다."
            });
        }

        if (userMessage) {
            conversations.push({ role: "user", content: userMessage });
        }

        const diaryList = [];
        for (let i = 3; i > 0; i--) {
            let targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);
            let startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            let endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            let diary = await Diary.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
            if (diary) {
                diaryList.push(diary);
            }
        }

        if (diaryList.length === 0) {
            return res.status(404).json({ message: '최근 3일 동안의 일기를 찾을 수 없습니다.' });
        }

        const response = await memoryTest(userInfo, diaryList, conversations);

        if (!response || response.error) {
            return res.status(500).json({ error: 'ChatGPT API로부터 응답을 받지 못했습니다.' });
        }

        if (response.content) {
    const responseText = response.content.trim();
    conversations.push({ role: "assistant", content: responseText });

    // 마지막 질문 확인 (responseText에서 "결과를 정리해 드릴게요" 또는 "마지막 질문" 포함 시 마지막 질문으로 판단)
    const isLastQuestion = responseText.includes("결과를 정리해 드릴게요") || responseText.includes("마지막 질문");

    if (isLastQuestion) {
        // 사용자의 마지막 응답이 기록되어 있는지 확인
        const lastUserMessageIndex = conversations.findIndex(conv => conv.role === "user" && conv.content.trim() !== "");
        
        // 마지막 질문 후 사용자의 응답이 없다면 응답을 기다림
        if (lastUserMessageIndex === -1 || lastUserMessageIndex < conversations.length - 2) {
            return res.status(200).json({
                conversations,
                nextAction: "사용자의 마지막 응답을 기다리고 있습니다."
            });
        }

        // 사용자의 마지막 응답을 처리하고 나서 CDR 점수 계산 진행
        const questionCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes("질문")).length;
        const correctCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes('정답')).length;
        const hintCnt = conversations.filter(conv => conv.role === 'assistant' && conv.content.includes('힌트')).length;

        // CDR 기억점수 계산 (0, 0.5, 1 중 하나)
        const cdrScore = calculateCdrScore(questionCnt, correctCnt, hintCnt);
        console.log("Calculated CDR Score: ", cdrScore);

        let recommendation = "";
        if (cdrScore >= 0.5) {
            recommendation = "CDR 기억점수가 0.5 이상입니다. 치매 자가진단을 추천드립니다.";
        }

        // 기억력 테스트 결과 저장
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

        // 결과와 함께 대화 종료 플래그 전송
        return res.status(200).json({
            conversations,
            cdrScore,  // CDR 점수 반환 (0, 0.5, 1 중 하나)
            recommendation,
            nextAction: "기억 테스트가 완료되었습니다.",
            isTestCompleted: true  // 대화 종료 플래그 추가
        });
    } else {
        // 마지막 질문이 아닐 경우, 다음 질문으로 진행
        return res.status(200).json({
            conversations,
            nextAction: "사용자의 응답을 기다리고 있습니다."
        });
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

