/*
const express = require('express');
const router = express.Router();

// 필요시 HTTP 요청을 처리하는 라우터 설정

module.exports = router;
*/

// 텍스트 기반 챗봇용(임시)

const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController2');

// 텍스트 기반 대화 처리
router.post('/:userId/text', handleChat);

module.exports = router;



