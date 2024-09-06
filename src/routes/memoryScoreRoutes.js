// 0831 - 미들웨어 추가
const express=require('express');
const router = express.Router();
const { startMemoryTest,getAllMemoryScores } = require('../controllers/memoryScoreController');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어

//기억 테스트
router.post('/',protect, startMemoryTest);
//기억 테스트 결과 조회
router.get('/', protect, getAllMemoryScores);

module.exports = router;