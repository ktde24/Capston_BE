// 0829 - JWT 토큰에서 userId 추출하도록
const asyncHandler = require('express-async-handler');
const ElderlyUser = require('../models/ElderlyUser');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// ObjectId 검증 미들웨어
const validateObjectId = (req, res, next) => {
  const diaryId = req.params.diaryId;
  if (!mongoose.Types.ObjectId.isValid(diaryId)) {
    return res.status(400).json({ message: '유효하지 않은 일기 ID입니다.' });
  }
  next();
};

// 사용자별 모든 일기 조회
const getAllDiaries = asyncHandler(async (req, res) => {
  const userId = req.user._id; // JWT 토큰에서 추출한 userId

  try {
    const diaries = await Diary.find({ userId });
    if (!diaries || diaries.length === 0) {
      return res.status(404).json({ message: '일기가 없습니다.' });
    }

    res.status(200).json(diaries);

  } catch (error) {
    console.error('일기 전체 조회 중 오류 발생:', error);
    res.status(500).json({ message: '일기 전체 조회에 실패했습니다.' });
  }
});

// 날짜별 특정 일기 조회
const getDiaryDate = asyncHandler(async (req, res) => {
  const userId = req.user._id; // JWT 토큰에서 추출한 userId
  const dateString = req.params.date; // YYYYMMDD 형식의 날짜 문자열

  // 날짜 형식 검증
  if (!/^\d{8}$/.test(dateString)) {
    return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
  }

  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

  try {
    const diary = await Diary.findOne({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    if (!diary) {
      return res.status(404).json({ message: '해당 날짜에 일기를 찾을 수 없습니다.' });
    }

    res.status(200).json(diary);

  } catch (error) {
    console.error('일기 조회 중 오류 발생:', error);
    res.status(500).json({ message: '일기 조회에 실패했습니다.' });
  }
});

// 특정 일기 조회
const getDiary = asyncHandler(async (req, res) => {
  const userId = req.user._id; // JWT 토큰에서 추출한 userId
  const diaryId = req.params.diaryId;

  try {
    const diary = await Diary.findById(diaryId);

    if (!diary) {
      return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
    }

    // 사용자가 해당 일기를 작성한 사람인지 확인
    if (!diary.userId.equals(userId)) {
      return res.status(403).json({ message: '이 일기에 대한 접근 권한이 없습니다.' });
    }

    res.status(200).json(diary);

  } catch (error) {
    console.error('일기 조회 중 오류 발생:', error);
    res.status(500).json({ message: '일기 조회에 실패했습니다.', error: error.message });
  }
});

// 특정 일기 삭제
const deleteDiary = asyncHandler(async (req, res) => {
  const userId = req.user._id; // JWT 토큰에서 추출한 userId
  const diaryId = req.params.diaryId;

  try {
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
    }

    if (!diary.userId.equals(userId)) {
      return res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
    }

    const result = await Diary.findOneAndDelete({ userId, _id: diaryId });

    if (!result) {
      return res.status(404).json({ message: '삭제할 수 없는 일기입니다.' });
    }

    res.status(200).json({ message: '일기 삭제 성공', deletedDiary: result });

  } catch (error) {
    console.error('일기 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '일기 삭제 실패' });
  }
});

// 특정 일기 수정
const updateDiary = asyncHandler(async (req, res) => {
  const { content } = req.body; // content 필드만 가져옴
  const userId = req.user._id; // JWT 토큰에서 추출한 userId
  const diaryId = req.params.diaryId;

  // content 필드가 비어 있으면 에러 반환
  if (!content) {
    return res.status(400).json({ message: 'Content 필드는 필수입니다.' });
  }

  try {
    // 일기 존재 확인
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
    }

    // 요청한 사용자가 해당 일기의 소유자인지 확인
    if (!diary.userId.equals(userId)) {
      return res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
    }

    // content 필드만 업데이트
    diary.content = content;
    const updatedDiary = await diary.save();

    res.status(200).json({ message: '일기 수정 성공', updatedDiary });

  } catch (error) {
    console.error('일기 수정 중 오류 발생:', error);
    res.status(500).json({ message: '일기 수정 실패' });
  }
});

module.exports = { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary, validateObjectId };
