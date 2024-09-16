const express = require('express');
const router = express.Router();
const { startAutomatedProcess } = require('../controllers/autoController');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

router.post('/start-automation', protect, createEmotionAnalysis);

module.exports = router;