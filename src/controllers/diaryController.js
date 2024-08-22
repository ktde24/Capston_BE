// 0817: 역할 수정(일기 조회, 수정, 삭제) - 생성은 chatController에서! + 날짜별 조회 추가
const asyncHandler = require('express-async-handler');
const ElderlyUser = require('../models/ElderlyUser');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// 사용자 id(/:userId)로 일기 전체 조회
const getAllDiaries = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // userId인 사용자의 모든 일기 조회
    const diaries = await Diary.find({ userId: user._id });
    if (!diaries || diaries.length === 0) {
      res.status(404).json({ message: '일기가 없습니다.' });
      return;
    }

    res.status(200).json(diaries);

  } catch (error) {
    console.error('일기 전체 조회 중 오류 발생:', error);
    res.status(500).json({ message: '일기 전체 조회에 실패했습니다.' });
  }
});

// 일기 id(/:userId/:date)로 특정 일기 조회(날짜)
const getDiaryDate = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const dateString = req.params.date.trim(); // YYYYMMDD 형식의 날짜 문자열
  
  // YYYYMMDD 형식의 문자열을 ISODate로 변환
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  
  const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      return res.status(400).json({ message: '사용자가 없습니다.' });
    }

    // 날짜 범위로 일기 조회
    const diary = await Diary.findOne({
      userId: user._id,
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

// 일기 id(/:userId/:diaryId)로 특정 일기 조회
const getDiary = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const diaryId = req.params.diaryId.trim(); // 공백문자 제거

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findOne({ userId: user._id, date: { $gte: startDate, $lte: endDate } });
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }

    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    res.status(200).json(diary);

  } catch (error) {
    console.error('일기 조회 중 오류 발생:', error);
    res.status(500).json({ message: '일기 조회에 실패했습니다.' });
  }
});

// 일기 id(/:userId/:diaryId)로 일기 삭제
const deleteDiary = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const diaryId = req.params.diaryId.trim(); // 공백문자 제거

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }
    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    // 일기 삭제
    const result = await Diary.findOneAndDelete({ userId: diary.userId, _id: diaryId });

    // 삭제된 일기가 없는 경우
    if (!result) {
      return res.status(404).json({ message: '삭제할 수 없는 일기입니다.' });
    }

    res.status(200).json({ message: '일기 삭제 성공', deletedDiary: result });

  } catch (error) {
    console.error('일기 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '일기 삭제 실패' });
  }
});

// 일기 id(/:userId/:diaryId)로 일기 수정
const updateDiary = asyncHandler(async (req, res) => {
  const updatedContent = req.body.content;
  const userId = req.params.userId;
  const diaryId = req.params.diaryId.trim(); // 공백문자 제거
  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }

    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    // 일기 수정
    const result = await Diary.findOneAndUpdate(
      { userId: diary.userId, _id: diaryId },
      { content: updatedContent },
      { new: true } // new: 업데이트된 문서 반환
    );

    // 수정한 일기가 없는 경우
    if (!result) {
      return res.status(404).json({ message: '수정할 수 없는 일기입니다.' });
    }

    res.status(200).json({ message: '일기 수정 성공', updatedDiary: result });

  } catch (error) {
    console.error('일기 수정 중 오류 발생:', error);
    res.status(500).json({ message: '일기 수정 실패' });
  }
});

module.exports = { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary };