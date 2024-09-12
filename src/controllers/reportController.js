const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const Diary = require('../models/Diary');
const MemoryScore = require('../models/MemoryScore');
const EmotionAnalysis = require('../models/EmotionAnalysis');

// 리포트 생성
const createReport = asyncHandler(async (req, res) => {
  const userId = req.user._id; // JWT 토큰에서 추출한 userId
  const { date } = req.params; // 클라이언트에서 전송된 날짜 (예: "2024-08-12")

  try {
      // 날짜 형식이 YYYY-MM-DD 인지 확인하는 정규식
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!date.match(dateRegex)) {
          return res.status(400).json({ message: '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.' });
      }

      // 클라이언트에서 보낸 날짜를 파싱하여 startOfDay와 endOfDay 계산
      const targetDate = new Date(`${date}T00:00:00.000Z`); // 명확한 ISO 8601 형식으로 변환
      console.log("파싱된 날짜:", targetDate); // 로그로 확인

      // 유효한 날짜인지 확인
      if (isNaN(targetDate.getTime())) {
          return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
      }

      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // 해당 날짜의 일기 가져오기
      const diary = await Diary.findOne({
          userId: userId,
          date: {
              $gte: startOfDay,
              $lte: endOfDay,
          },
      });

      if (!diary) {
          return res.status(404).json({ message: '해당 날짜에 대한 일기를 찾을 수 없습니다.' });
      }

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

      if (!emotionAnalysis || !emotionAnalysis._id) {
          console.log('감정분석 결과를 찾을 수 없거나, 해당 다이어리 아이디를 찾을 수 없습니다.', diary._id);
          return res.status(404).json({ message: '해당 일기에 대한 감정 분석 결과를 찾을 수 없습니다.' });
      }

      // 리포트 생성
      const report = new Report({
          userId,
          diaryId: diary._id,
          date: diary.date,
          messages: diary.messageToChild,
          cdrScore: memoryScore ? memoryScore.cdrScore : null,
          correctRatio: memoryScore ? memoryScore.correctRatio : null,
          memoryScoreId: memoryScore ? memoryScore._id : null,
          emotions: emotionAnalysis.emotions,
          conditions: diary.healthStatus,
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
    const userId = req.user._id; // JWT 토큰에서 추출한 userId

    try {
        // 사용자의 모든 리포트 조회
        const reports = await Report.find({ userId: userId })
            .select('date cdrScore correctRatio emotions conditions') // 필요한 필드만 선택
            .populate({
                path: 'diaryId',
                select: 'date messages healthStatus' // diary 필드에서도 필요한 것만 선택
            })
            .exec();

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: '리포트를 찾을 수 없습니다.' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '리포트 조회에 실패했습니다.' });
    }
});

// 특정 날짜의 리포트 조회 (시간 부분은 무시하고 월, 일까지만 비교)
const getReportsByDate = asyncHandler(async (req, res) => {
    const userId = req.user._id; // JWT 토큰에서 추출한 userId
    const { date } = req.params;

    try {
        if (!date || isNaN(new Date(date))) {
            return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
        }

        // 지정된 날짜의 리포트 조회 (날짜를 기준으로 조회, 시간 부분은 무시)
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // Report를 emotions 필드를 포함해 조회
        const reports = await Report.find({
            userId: userId,
            date: { $gte: startOfDay, $lt: endOfDay },
        })
            .select('date cdrScore correctRatio emotions conditions') // 필요한 필드만 선택
            .populate({
                path: 'diaryId',
                select: 'date messages healthStatus' // diary 필드에서도 필요한 것만 선택
            })
            .exec();

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: '해당 날짜에 리포트가 없습니다.' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '리포트 조회에 실패했습니다.' });
    }
});

module.exports = { createReport, getAllReports, getReportsByDate };
