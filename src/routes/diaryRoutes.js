// 0908ver - 미들웨어 추가

const express = require('express');
const { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary, validateObjectId } = require('../controllers/diaryController');
const router = express.Router();

router.get('/', getAllDiaries); // 모든 일기 조회
router.get('/:diaryId', validateObjectId, getDiary); // 특정 일기 조회
router.get('/date/:date', getDiaryDate); // 특정 날짜의 일기 조회
router.delete('/:diaryId', validateObjectId, deleteDiary); // 특정 일기 삭제
router.put('/:diaryId', validateObjectId, updateDiary); // 특정 일기 수정

module.exports = router;
