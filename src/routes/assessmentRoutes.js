// 0829ver
const express = require('express');
const router = express.Router();
const {
    createAssessment,
    getAssessmentsByUser,
    getAssessmentsByGuardian,
    deleteAssessment
  } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

// 자가진단 결과 생성
router.post('/', assessmentController.createAssessment);

// 특정 사용자의 자가진단 결과 조회 (KDSQ 또는 PRMQ)
router.get('/user/:questionnaireType', assessmentController.getAssessmentsByUser);

// 특정 보호자와 관련된 모든 자가진단 결과 조회
router.get('/guardian', assessmentController.getAssessmentsByGuardian);

// 특정 자가진단 결과 삭제(id: 자가진단 결과의 고유 식별자)
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;




