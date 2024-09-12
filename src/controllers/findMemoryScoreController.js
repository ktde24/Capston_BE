// 기억점수 조회용(REST API 방식) 
const asyncHandler = require('express-async-handler');
const ElderlyUser = require('../models/ElderlyUser');
const MemoryScore = require('../models/MemoryScore');
const GuardianUser = require('../models/GuardianUser');

// 사용자 id 또는 보호자 id로 기억 점수 전체 조회
const getAllMemoryScores = asyncHandler(async (req, res) => {
    const user = req.user;  // JWT 토큰에서 추출한 사용자 정보

    try {
        let scores;

        // 노인 사용자일 경우
        if (user instanceof ElderlyUser) {
            scores = await MemoryScore.find({ userId: user._id })
                .sort({ date: 'asc' })
                .select('date cdrScore correctRatio questionCnt hintCnt correctCnt');

            if (!scores || scores.length === 0) {
                return res.status(404).json({ message: '기억 테스트 내역이 없습니다.' });
            }

        // 보호자 사용자일 경우
        } else if (user instanceof GuardianUser) {
            // 보호자와 연결된 노인 사용자의 기억 점수를 조회
            const elderlyUsers = await ElderlyUser.find({ guardianPhone: user.phone });
            const elderlyUserIds = elderlyUsers.map(elderly => elderly._id);

            scores = await MemoryScore.find({ userId: { $in: elderlyUserIds } })
                .sort({ date: 'asc' })
                .select('date cdrScore correctRatio correctCnt hintCnt');

            if (!scores || scores.length === 0) {
                return res.status(404).json({ message: '노인 사용자의 기억 테스트 내역이 없습니다.' });
            }

        } else {
            return res.status(403).json({ message: '권한이 없습니다.' });
        }

        // 기억 점수를 꺾은선 그래프에 사용할 수 있도록 날짜별로 정렬해서 반환
        const response = scores.map(score => ({
            date: score.date,
            cdrScore: score.cdrScore,
            correctRatio: score.correctRatio,
            correctCount: score.correctCnt,
            hintCount: score.hintCnt
        }));

        // 성공적으로 조회한 기억 점수를 반환
        res.status(200).json({ scores: response });

    } catch (error) {
        console.error('기억 점수 전체 조회 중 오류 발생:', error);
        res.status(500).json({ message: '기억 점수 전체 조회에 실패했습니다.', error: error.message });
    }
});

module.exports = { getAllMemoryScores };
