// 0829 - 미들웨어 추가
const express = require('express');
const { createReport, getAllReports, getReportsByDate } = require('../controllers/reportController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

// 날짜 형식 검증 미들웨어 (YYYY-MM-DD 형식 체크)
const validateDate = (req, res, next) => {
    const { date } = req.params;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
    if (!date || !date.match(dateRegex)) {
      return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식이어야 합니다.' });
    }
  
    next();
  };

router.post('/:date', protect, validateDate, createReport);
router.get('/', protect, getAllReports);
router.get('/:date', protect, validateDate, getReportsByDate);

module.exports = router;
