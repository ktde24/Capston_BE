// 자가진단 컨트롤러
// 0720 ver((middelwares 경로 수정 필요))

const Assessment = require('../models/Assessment');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

// 자가진단 점수 계산 함수
const calculateScore = (answers) => {
  return answers.reduce((total, answer) => total + parseInt(answer.score, 10), 0);
};

// 자가진단 결과 저장 (PRMQ)
// 8점 이상이면 병원 방문 권유
const savePRMQAssessment = async (req, res) => {
  const { userId } = req.params;
  const { answers } = req.body;

  const score = calculateScore(answers);
  const assessment = new Assessment({
    userId,
    questionnaireType: 'PRMQ',
    answers,
    score,
    date: new Date(),
  });

  try {
    const newAssessment = await assessment.save();
    let message = '자가진단 결과가 저장되었습니다.';
    if (score >= 8) {
      message += '8점 이상이므로 병원 방문을 권유합니다.';
    }
    res.status(201).json({ assessment: newAssessment, message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 자가진단 결과 저장 (KDSQ)
const saveKDSQAssessment = async (req, res) => {
  const { userId } = req.params;
  const { guardianId, answers } = req.body;

  const score = calculateScore(answers);
  const assessment = new Assessment({
    userId,
    guardianId,
    questionnaireType: 'KDSQ',
    answers,
    score,
    date: new Date(), // 현재 날짜와 시간을 나타내는 새로운 객체 생성
  });

  try {
    const newAssessment = await assessment.save();
    let message = '자가진단 결과가 저장되었습니다.';
    if (score >= 8) {
      message += '8점 이상이므로 병원 방문을 권유합니다.';
    }
    res.status(201).json({ assessment: newAssessment, message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 자가진단 결과 조회
const getAssessments = async (req, res) => {
    const { userId } = req.params;
    const { user } = req; // 인증된 사용자 정보
  
    try {
      // 노인 사용자 정보 확인
      const elderlyUser = await ElderlyUser.findById(userId);
  
      // 보호자인지 확인
      if (user.role === 'guardian') {
        const guardianUser = await GuardianUser.findById(user._id);
        if (!guardianUser || !guardianUser.elders.includes(userId)) {
          return res.status(403).json({ message: '접근 권한이 없습니다.' });
        }
      } else if (user.role !== 'elderly' || user._id !== userId) {
        // 노인 사용자가 자신의 데이터를 조회하는지 확인
        return res.status(403).json({ message: '접근 권한이 없습니다.' });
      }
  
      const assessments = await Assessment.find({ userId });
      res.json(assessments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  module.exports = {
    savePRMQAssessment,
    saveKDSQAssessment,
    getAssessments,
  };