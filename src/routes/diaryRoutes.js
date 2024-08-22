// 0813ver

const express = require('express');
const router = express.Router();
const { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary } = require('../controllers/diaryController');

// 사용자별 모든 일기 조회
router.get('/:userId', getAllDiaries);

// 날짜별 일기 조회
router.get('/:userId/:date', getDiaryDate);

// 특정 일기 조회
router.get('/:userId/:diaryId', getDiary);

// 일기 삭제
router.delete('/:userId/:diaryId', deleteDiary);

// 일기 수정
router.patch('/:userId/:diaryId', updateDiary);

module.exports = router;
