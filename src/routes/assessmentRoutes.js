// 0724 ver(middelwares 경로 수정 필요)
const express = require('express');
const {
  savePRMQAssessment,
  saveKDSQAssessment,
  getPRMQAssessments,
  getKDSQAssessments
} = require('../controllers/assessmentController');
const router = express.Router();

// 자가진단 결과 저장 (PRMQ)
router.post('/elderly/:userId/self-diagnosis/prmq', savePRMQAssessment);

// 자가진단 결과 저장 (KDSQ)
router.post('/elderly/:userId/self-diagnosis/kdsq', saveKDSQAssessment);

// PRMQ 자가진단 결과 조회
router.get('/elderly/:userId/self-diagnosis/prmq', getPRMQAssessments);

// KDSQ 자가진단 결과 조회
router.get('/elderly/:userId/self-diagnosis/kdsq', getKDSQAssessments);

module.exports = router;
