// 0813
const express = require('express');
const router = express.Router();
const { createReport, getAllReports, getReportsByDate } = require('../controllers/reportController');

// Report 생성
router.post('/:userId', createReport);

// 특정 사용자의 모든 리포트 조회
router.get('/:userId', getAllReports);

// 특정 날짜의 리포트 조회
router.get('/:userId/date/:date', getReportsByDate);

module.exports = router;
