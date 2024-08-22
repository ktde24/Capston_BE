// 0812 ver
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// 자가진단 결과 생성
router.post('/', assessmentController.createAssessment);

// 특정 사용자의 자가진단 결과 조회 (KDSQ 또는 PRMQ)
router.get('/user/:userId/:questionnaireType', assessmentController.getAssessmentsByUser);

// 특정 보호자와 관련된 모든 자가진단 결과 조회
router.get('/guardian/:guardianId', assessmentController.getAssessmentsByGuardian);

// 특정 자가진단 결과 삭제
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;




