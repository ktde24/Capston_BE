// 0806 ver(조회 추가)
const express = require('express');
const router = express.Router();
const { createEmotionAnalysis, getEmotionAnalysisByDate } = require('../controllers/emotionAnalysisController');

// 감정 분석 결과 생성
router.post('/:diaryId', createEmotionAnalysis);

// 감정 분석 결과 조회
router.get('/:userId/:date', getEmotionAnalysisByDate);

module.exports = router;


