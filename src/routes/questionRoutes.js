// 0720 ver

const express = require('express');
const KDSQQuestion = require('../models/KDSQQuestion');
const PRMQQuestion = require('../models/PRMQQuestion');
const router = express.Router();

// KDSQ 질문 조회
router.get('/kdsq', async (req, res) => {
  try {
    const questions = await KDSQQuestion.find(); // 모든 KDSQ 질문 조회
    res.json(questions); // 조회된 질문을 JSON 형식으로 응답
  } catch (err) {
    res.status(500).json({ message: err.message }); // 오류 발생 시 오류 메시지 응답
  }
});

// PRMQ 질문 조회
router.get('/prmq', async (req, res) => {
  try {
    const questions = await PRMQQuestion.find(); // 모든 PRMQ 질문 조회
    res.json(questions); // 조회된 질문을 JSON 형식으로 응답
  } catch (err) {
    res.status(500).json({ message: err.message }); // 오류 발생 시 오류 메시지 응답
  }
});

module.exports = router;
