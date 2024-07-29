// 0725 ver
const express = require('express');
const { startTTS } = require('../controllers/ttsController');

const router = express.Router();

// TTS 변환 요청
router.post('/start', startTTS);

module.exports = router;
