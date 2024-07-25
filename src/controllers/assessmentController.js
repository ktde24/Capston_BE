// 자가진단 컨트롤러
// 0720 ver((middelwares 경로 수정 필요))

const Assessment = require('../models/Assessment');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');
const mongoose = require('mongoose');

// 자가진단 점수 계산 함수
const calculateScore = (answers) => {
  return answers.reduce((total, answer) => total + parseInt(answer.score, 10), 0);
};

// 자가진단 결과 저장 (PRMQ)
// 8점 이상이면 병원 방문 권유
const savePRMQAssessment = async (req, res) => {
  const { userId } = req.params;
  const { answers } = req.body;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const score = calculateScore(answers);
    const assessment = new Assessment({
      userId: userObjectId,
      questionnaireType: 'PRMQ',
      answers,
      score,
      date: new Date(),
    });

    const newAssessment = await assessment.save();
    let message = '자가진단 결과가 저장되었습니다.';
    if (score >= 8) {
      message += ' 8점 이상이므로 병원 방문을 권유합니다.';
    }
    res.status(201).json({ assessment: newAssessment, message: message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 자가진단 결과 저장 (KDSQ)
const saveKDSQAssessment = async (req, res) => {
  const { userId } = req.params;
  const { guardianId, answers } = req.body;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const guardianObjectId = new mongoose.Types.ObjectId(guardianId);
    const score = calculateScore(answers);
    const assessment = new Assessment({
      userId: userObjectId,
      guardianId: guardianObjectId,
      questionnaireType: 'KDSQ',
      answers,
      score,
      date: new Date(),
    });

    const newAssessment = await assessment.save();
    let message = '자가진단 결과가 저장되었습니다.';
    if (score >= 8) {
      message += ' 8점 이상이므로 병원 방문을 권유합니다.';
    }
    res.status(201).json({ assessment: newAssessment, message: message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PRMQ 자가진단 결과 조회
const getPRMQAssessments = async (req, res) => {
  const { userId } = req.params;

  try {
    const assessments = await Assessment.find({
      userId: new mongoose.Types.ObjectId(userId),
      questionnaireType: 'PRMQ'
    });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// KDSQ 자가진단 결과 조회
const getKDSQAssessments = async (req, res) => {
  const { userId } = req.params;

  try {
    const assessments = await Assessment.find({
      userId: new mongoose.Types.ObjectId(userId),
      questionnaireType: 'KDSQ'
    });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  savePRMQAssessment,
  saveKDSQAssessment,
  getPRMQAssessments,
  getKDSQAssessments,
};
