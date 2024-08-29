// 0829
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 요청 헤더에 Authorization이 포함되어 있고 Bearer로 시작하는지 확인
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Bearer 토큰에서 실제 토큰 부분만 추출
      token = req.headers.authorization.split(' ')[1];
      console.log('사용자 토큰:', token); // 토큰이 제대로 분리되었는지 확인

      // 토큰을 검증하고, 포함된 사용자 정보 추출
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('디코딩된 토큰:', decoded); // 토큰이 제대로 디코딩되었는지 확인

      // 노인 사용자 또는 보호자 사용자를 데이터베이스에서 찾기
      req.user = await ElderlyUser.findById(decoded.id).select('-password') || 
                 await GuardianUser.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      // 로그 추가: req.user가 제대로 설정되었는지 확인
      console.log('인증된 사용자:', req.user);

      next(); // 다음 미들웨어 또는 컨트롤러로 이동

    } catch (error) {
      console.error('JWT 검증 실패:', error);
      res.status(401).json({ message: '인증 실패, 토큰이 유효하지 않습니다.' });
    }
  } else {
    res.status(401).json({ message: '인증 실패, 토큰이 제공되지 않았습니다.' });
  }
});

module.exports = { protect };
