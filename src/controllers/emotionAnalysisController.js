//0805 ver
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const EmotionAnalysis = require('../models/EmotionAnalysis');
const Diary = require('../models/Diary');

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

// 일기 생성 및 감정 분석 결과 저장
const createEmotionAnalysis = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { diaryId } = req.params;

  try {
    // DB에서 일기 내용 가져오기
    const diaryEntry = await Diary.findById(diaryId);
    if (!diaryEntry) {
      return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
    }

    const diary = diaryEntry.content;

    // Flask 서버로 감정 분석 요청
    const emotions = await analyzeDiary(diary);

    // 감정 분석 결과 저장
    const newEmotionAnalysis = new EmotionAnalysis({ userId, diaryId, emotions });
    await newEmotionAnalysis.save();

    res.status(201).json({ message: '감정 분석 결과가 저장되었습니다.', analysis: newEmotionAnalysis });
  } catch (error) {
    res.status(500).json({ message: '오류가 발생했습니다.', error: error.message });
  }
});

module.exports = { createEmotionAnalysis };
