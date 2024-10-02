// 0908ver - 미들웨어 추가

const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // JWT 미들웨어 가져오기
const { getAllDiaries, getDiaryDate, getDiary, deleteDiary, updateDiary, validateObjectId } = require('../controllers/diaryController');
const router = express.Router();

router.get('/', protect, getAllDiaries); // JWT 인증 미들웨어 추가
router.get('/:diaryId', protect, validateObjectId, getDiary); // JWT 인증 미들웨어 추가
router.get('/date/:date', protect, getDiaryDate); // JWT 인증 미들웨어 추가
router.delete('/:diaryId', protect, validateObjectId, deleteDiary); // JWT 인증 미들웨어 추가
router.put('/:diaryId', protect, validateObjectId, updateDiary); // JWT 인증 미들웨어 추가

module.exports = router;
