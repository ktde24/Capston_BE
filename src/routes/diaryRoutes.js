// 0829ver - 미들웨어 추가

const express = require('express');
const router = express.Router();
const { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary } = require('../controllers/diaryController');

// 사용자별 모든 일기 조회
router.get('/', getAllDiaries);

// 날짜별 일기 조회
router.get('/:date', getDiaryDate);

// 특정 일기 조회
router.get('/:diaryId', getDiary);

// 일기 삭제
router.delete('/:diaryId', deleteDiary);

// 일기 수정
router.patch('/:diaryId', updateDiary);

module.exports = router;
