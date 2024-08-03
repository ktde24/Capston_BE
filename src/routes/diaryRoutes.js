const express=require('express');
const router = express.Router();
const { makeDiary,getAllDiaries,getDiary,deleteDiary,updateDiary } = require('../controllers/diaryController');

//일기 생성
router.post('/api/diary/:UserId/:sessionId',makeDiary);
//사용자별 모든 일기 조회
router.get('/:userId', getAllDiaries);
//특정 일기 조회
router.get('/:userId/:diaryId', getDiary);
//일기 삭제
router.delete('/:userId/:diaryId', deleteDiary);
//일기 수정
router.patch('/:userId/:diaryId', updateDiary);

module.exports = router;