// 0813 ver
const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const Diary = require('../models/Diary');
const MemoryScore = require('../models/MemoryScore');
const EmotionAnalysis = require('../models/EmotionAnalysis');
const GuardianUser = require('../models/GuardianUser');
const ElderlyUser = require('../models/ElderlyUser');

// 일기 생성
const createReport = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const { date } = req.body; // 클라이언트에서 전송된 날짜 (예: "2024-08-12")

    try {
        // 클라이언트에서 보낸 날짜를 파싱하여 startOfDay와 endOfDay 계산
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // 해당 날짜의 일기 가져오기 (시간 무시하고 월, 일만 비교)
        const diary = await Diary.findOne({
            userId: userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });


        // 일기가 제대로 조회되었는지 확인
        if (!diary) {
            return res.status(404).json({ message: '해당 날짜에 대한 일기를 찾을 수 없습니다.' });
        }

        // 일기 ID를 콘솔에 출력하여 확인
        console.log('Diary ID:', diary._id);

        // 해당 날짜의 기억 점수 가져오기
        const memoryScore = await MemoryScore.findOne({
            userId: userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });

        // 감정 분석 결과 가져오기
        const emotionAnalysis = await EmotionAnalysis.findOne({ diaryId: diary._id });

        // 감정 분석 결과가 제대로 조회되었는지 확인
        if (!emotionAnalysis) {
            console.log('Emotion Analysis not found for Diary ID:', diary._id);
            return res.status(404).json({ message: '해당 일기에 대한 감정 분석 결과를 찾을 수 없습니다.' });
        }

        // 감정 분석 결과를 콘솔에 출력하여 확인
        console.log('Emotion Analysis:', emotionAnalysis);

        // 리포트 생성
        const report = new Report({
            userId,
            diaryId: diary._id,
            date: diary.date,
            messages: diary.messageToChild, // 자녀에게 전하고 싶은 말
            cdrScore: memoryScore ? memoryScore.cdrScore : null, // 기억 점수 cdrScore 저장
            memoryScoreId: memoryScore ? memoryScore._id : null, // 기억 점수 ID
            emotions: emotionAnalysis._id, // 감정 분석 결과
            conditions: diary.healthStatus, // 건강 상태
        });

        await report.save();

        res.status(201).json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '리포트 생성에 실패했습니다.' });
    }
});


// 특정 사용자의 모든 리포트 조회
const getAllReports = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const requesterId = req.user._id; // 요청하는 사용자의 ID (보호자 또는 노인 사용자)

    try {
        // 노인 사용자 확인
        const user = await ElderlyUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 보호자 확인 및 권한 검사
        const guardian = await GuardianUser.findById(requesterId);
        if (guardian) {
            if (!guardian.elderlyUsers.includes(userId)) { // 보호자가 관리하는 노인 사용자인지 확인
                return res.status(403).json({ message: '이 사용자의 리포트를 조회할 권한이 없습니다.' });
            }
        } else if (!user._id.equals(requesterId)) { // 요청자가 보호자가 아니면서 노인 사용자도 아닌 경우
            return res.status(403).json({ message: '리포트를 조회할 권한이 없습니다.' });
        }

        // Report를 emotions 필드를 포함해 조회
        const reports = await Report.find({ userId }).populate('emotions').exec();

        res.status(200).json(reports);

    } catch (error) {
        res.status(500).json({ message: '리포트 조회에 실패했습니다.' });
    }
});


// 특정 날짜의 리포트 조회 (시간 부분은 무시하고 월, 일까지만 비교)
const getReportsByDate = asyncHandler(async (req, res) => {
    const { userId, date } = req.params;
    const requesterId = req.user._id; // 요청하는 사용자의 ID (보호자 또는 노인 사용자)

    try {
        // 노인 사용자 확인
        const user = await ElderlyUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 보호자 확인 및 권한 검사
        const guardian = await GuardianUser.findById(requesterId);
        if (guardian) {
            if (!guardian.elderlyUsers.includes(userId)) { // 보호자가 관리하는 노인 사용자인지 확인
                return res.status(403).json({ message: '이 사용자의 리포트를 조회할 권한이 없습니다.' });
            }
        } else if (!user._id.equals(requesterId)) { // 요청자가 보호자가 아니면서 노인 사용자도 아닌 경우
            return res.status(403).json({ message: '리포트를 조회할 권한이 없습니다.' });
        }

        // 지정된 날짜의 리포트 조회 (날짜를 기준으로 조회, 시간 부분은 무시)
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

        // Report를 emotions 필드를 포함해 조회
        const reports = await Report.find({
            userId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay,
            }
        }).populate('emotions').exec();

        if (!reports.length) {
            return res.status(404).json({ message: '해당 날짜에 리포트가 없습니다.' });
        }

        res.status(200).json(reports);

    } catch (error) {
        res.status(500).json({ message: '리포트 조회에 실패했습니다.' });
    }
});


module.exports = { createReport, getAllReports, getReportsByDate };
