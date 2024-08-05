// 0805 ver
const express = require('express');
const router = express.Router();
const { createEmotionAnalysis } = require('../controllers/emotionAnalysisController');

// 감정 분석 결과 생성
router.post('/:diaryId', createEmotionAnalysis);

module.exports = router;

