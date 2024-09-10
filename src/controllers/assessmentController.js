// 자가진단 컨트롤러
// 0829 ver - JWT 토큰에서 userId 추출하도록
const asyncHandler = require('express-async-handler');
const Assessment = require('../models/Assessment');

// 새로운 자가진단 결과 생성
exports.createAssessment = asyncHandler(async (req, res) => {
  try {
    const { guardianId, questionnaireType, score, date } = req.body;
    const userId = req.user._id; // JWT 토큰에서 추출한 userId

    if (!['KDSQ', 'PRMQ'].includes(questionnaireType)) {
      return res.status(400).json({ message: 'Invalid questionnaire type' });
    }

    if (questionnaireType === 'KDSQ' && !guardianId) {
      return res.status(400).json({ message: 'Guardian ID가 필요합니다.' });
    }

    if (questionnaireType === 'PRMQ' && guardianId) {
      return res.status(400).json({ message: 'Guardian ID가 필요하지 않습니다.' });
    }

    const newAssessment = new Assessment({
      userId,
      guardianId: questionnaireType === 'KDSQ' ? guardianId : null,
      questionnaireType,
      score,
      date
    });

    await newAssessment.save();
    res.status(201).json({ message: '성공', data: newAssessment });
  } catch (error) {
    res.status(500).json({ message: '실패', error });
  }
});

// 특정 사용자의 자가진단 결과 조회
exports.getAssessmentsByUser = asyncHandler(async (req, res) => {
  try {
    const { questionnaireType } = req.params;
    const userId = req.user._id; // JWT 토큰에서 추출한 userId

    const assessments = await Assessment.find({
      userId,
      questionnaireType
    });

    if (assessments.length === 0) {
      return res.status(404).json({ message: '자가진단 결과를 찾을 수 없습니다.' });
    }

    res.status(200).json({ data: assessments });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving assessments', error });
  }
});

// 특정 날짜에 해당하는 자가진단 결과 조회
exports.getAssessmentsByDate = asyncHandler(async (req, res) => {
  try {
    const { date, questionnaireType } = req.query; // 날짜와 설문 유형을 쿼리로 받음
    const userId = req.user._id; // JWT 토큰에서 추출한 userId

    // 조회할 날짜의 시작과 끝을 설정
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // 다음 날로 설정하여 당일 자정까지 포함

    // 자가진단 결과 조회 (지정된 날짜와 설문 유형에 따른 필터링)
    const assessments = await Assessment.find({
      userId,
      questionnaireType,
      date: {
        $gte: startDate,  // 지정한 날짜의 00:00:00
        $lt: endDate      // 다음 날 00:00:00 전까지
      }
    });

    if (assessments.length === 0) {
      return res.status(404).json({ message: '해당 날짜에 자가진단 결과를 찾을 수 없습니다.' });
    }

    res.status(200).json({ data: assessments });
  } catch (error) {
    res.status(500).json({ message: '자가진단 결과 조회 중 오류가 발생했습니다.', error });
  }
});


// 특정 보호자가 관련된 모든 자가진단 결과 조회
exports.getAssessmentsByGuardian = asyncHandler(async (req, res) => {
  try {
    const guardianId = req.user._id; // JWT 토큰에서 추출한 guardianId

    // guardianId로 KDSQ(보호자가 수행한)와 PRMQ(노인 사용자가 수행한) 결과를 모두 조회
    const assessments = await Assessment.find({
      $or: [
        { guardianId: guardianId },  // 보호자가 수행한 KDSQ 결과
        { userId: guardianId }       // 노인 사용자가 수행한 PRMQ 결과를 관리하는 보호자
      ]
    });

    if (assessments.length === 0) {
      return res.status(404).json({ message: '자가진단 결과를 찾을 수 없습니다.' });
    }

    res.status(200).json({ data: assessments });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving assessments', error });
  }
});

// 특정 자가진단 결과 삭제
exports.deleteAssessment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // JWT 토큰에서 추출한 userId

    const assessment = await Assessment.findOne({ _id: id, userId });

    if (!assessment) {
      return res.status(404).json({ message: '자가진단 결과를 찾을 수 없습니다.' });
    }

    await Assessment.findByIdAndDelete(id);
    res.status(200).json({ message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '삭제 실패', error });
  }
});
