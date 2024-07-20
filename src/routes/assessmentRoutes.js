// 0720 ver(middelwares 경로 수정 필요)
const express = require('express');
const { savePRMQAssessment, saveKDSQAssessment, getAssessments } = require('../controllers/assessmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 자가진단 결과 저장 (PRMQ)
router.post('/elderly/:userId/self-diagnosis/prmq', authMiddleware, savePRMQAssessment);

// 자가진단 결과 저장 (KDSQ)
router.post('/elderly/:userId/self-diagnosis/kdsq', authMiddleware, saveKDSQAssessment);

// 자가진단 결과 조회
router.get('/elderly/:userId/self-diagnosis', authMiddleware, getAssessments);

module.exports = router;

