const { createDiary } = require('./chatController');
const { createEmotionAnalysis } = require('./emotionAnalysisController');
const { createReport } = require('./reportController');

// 일기 생성 -> 감정 분석 -> 리포트 생성 순차적으로 실행하는 함수
async function startAutomatedProcess() {
  try {
    // 1. 일기 생성(수정 필요)
    const diary = await createDiary();
    if (!diary) {
      console.error('일기 생성에 실패했습니다.');
      return;
    }
    console.log('일기 생성 완료:', diary._id);

    // 2. 감정 분석
    const emotionResult = await createEmotionAnalysis(diary._id);
    if (!emotionResult) {
      console.error('감정 분석에 실패했습니다.');
      return;
    }
    console.log('감정 분석 완료:', emotionResult);

    // 3. 리포트 생성
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