// 0912 - 기억점수 조회용
const express=require('express');
const router = express.Router();
const { getAllMemoryScores, getLatestMemoryScores } = require('../controllers/findMemoryScoreController');
const { protect } = require('../middleware/authMiddleware'); // JWT 검증 미들웨어
//const multer = require('multer'); // 음성 파일 업로드용

// multer 설정
//const upload = multer({ storage: multer.memoryStorage() }); // 메모리에 파일 저장

// 기억 테스트 (STT와 TTS를 처리하는 경우, 음성 데이터를 포함하여 전송)
//router.post('/', protect, upload.single('file'), startMemoryTest);

// 기억 테스트 결과 조회
router.get('/', protect, getAllMemoryScores);

// 최신 5개 기억 점수 조회
router.get('/latest', protect, getLatestMemoryScores);

module.exports = router;