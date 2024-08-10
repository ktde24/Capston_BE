
const express=require('express');
const router = express.Router();
const { startMemoryTest,getAllMemoryScores } = require('../controllers/memoryScoreController');

//기억 테스트
router.post('/:userId',startMemoryTest);
//기억 테스트 결과 조회
router.get('/:userId', getAllMemoryScores);

module.exports = router;