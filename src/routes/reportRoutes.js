// 0829 - 미들웨어 추가
const express = require('express');
const { createReport, getAllReports, getReportsByDate } = require('../controllers/reportController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

router.post('/', protect, createReport);
router.get('/', protect, getAllReports);
router.get('/:date', protect, getReportsByDate);

module.exports = router;
