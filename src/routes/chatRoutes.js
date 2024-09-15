// 텍스트 기반 챗봇용(임시)
// html 파일로 테스트 증(라우터 사용X)

const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController2');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어
// handleChat이 undefined인지 확인
//console.log(handleChat);

// 텍스트 기반 대화 처리
//router.post('/text', protect, handleChat);

module.exports = router;



