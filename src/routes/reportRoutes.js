// 0813
const express = require('express');
const { createReport, getAllReports, getReportsByDate } = require('../controllers/reportController');
const router = express.Router();

router.post('/:userId', createReport);
router.get('/:userId', getAllReports);
router.get('/:userId/:date', getReportsByDate);

module.exports = router;
