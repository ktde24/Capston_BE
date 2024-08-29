// 0829 ver - 미들웨어 추가
const express = require('express');
const router = express.Router();
const { createEmotionAnalysis, getEmotionAnalysisByDate } = require('../controllers/emotionAnalysisController');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

// 감정 분석 결과 생성
router.post('/:diaryId', protect, createEmotionAnalysis);

// 감정 분석 결과 조회
router.get('/:date', protect, getEmotionAnalysisByDate);

module.exports = router;


