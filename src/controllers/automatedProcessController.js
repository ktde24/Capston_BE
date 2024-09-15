const asyncHandler = require('express-async-handler');
const { createDiary } = require('./chatController');
const { createEmotionAnalysis } = require('./emotionAnalysisController');
const { createReport } = require('./reportController');
const mongoose = require('mongoose');

// Flask 서버로 감정 분석 요청
const analyzeDiary = async (diary) => {
  try {
    const response = await axios.post('http://localhost:5000/predict', { diary });
    return response.data;
  } catch (error) {
    console.error('오류 발생:', error.message);
    throw new Error('감정 분석 요청 중 오류 발생');
  }
};

// JWT 토큰에서 userId 추출
function getUserFromToken(token) {
  const secretKey = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.id;
  } catch (err) {
    console.error('토큰 검증 실패', err);
    return null;
  }
}


// 일기 생성 -> 감정 분석 -> 리포트 생성 순차적으로 실행하는 함수
// 자동화 프로세스 실행 함수
async function startAutomatedProcess() {
  try {
    // 1. 일기 생성
    const diary = await createDiary();
    if (!diary) {
      console.error('일기 생성에 실패했습니다.');
      return;
    }
    console.log('일기 생성 완료:', diary._id);

    // 2. 감정 분석
    const emotionResult = await analyzeEmotion(diary._id);
    if (!emotionResult) {
      console.error('감정 분석에 실패했습니다.');
      return;
    }
    console.log('감정 분석 완료:', emotionResult);

    // 3. 감정 분석 결과 저장
    await createEmotionAnalysis({ diaryId: diary._id, emotions: emotionResult });

    // 4. 리포트 생성
    const report = await createReport({ userId: diary.userId, date: diary.date });
    if (!report) {
      console.error('리포트 생성에 실패했습니다.');
      return;
    }
    console.log('리포트 생성 완료:', report._id);
    
  } catch (error) {
    console.error('자동화 작업 중 오류 발생:', error);
  }
}

module.exports = { startAutomatedProcess };