const asyncHandler = require('express-async-handler');
const { memoryTest } = require('../utils/chatgpt');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');
const MemoryScore = require('../models/MemoryScore');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// 기억 테스트 시작
const startMemoryTest = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const msg = req.body.message;

  let conversations = []; // 테스트 대화 저장용
  if (msg) { // 사용자 입력
    conversations.push({
      role: "user",
      content: msg,
    });
  }

  let today = new Date();

  let diaryList = [];

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 보호자 정보 가져오기
    const guardian = await GuardianUser.findById(user.guardianId);
    if (!guardian) {
      return res.status(404).json({ message: '보호자 정보를 불러오는 데 실패했습니다.' });
    }

    // 3일치 일기 가져오기
    for (let i = 0; i < 3; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);

      let startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      let endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      let diary = await Diary.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
      if (diary) {
        diaryList.push(diary);
      }
    }

    // 기억 테스트 생성
    const response = await memoryTest(guardian, diaryList, conversations);

    if (response) {
      // 기억 점수 저장 로직 추가
      const memoryScore = new MemoryScore({
        userId: user._id,
        date: today,
        questionCnt: response.questionCnt,
        hintCnt: response.hintCnt,
        correctCnt: response.correctCnt,
        cdrScore: response.cdrScore,
        diaryIds: diaryList.map(diary => diary._id)
      });
      await memoryScore.save();

      res.json({ conversations, response });
    } else {
      res.status(500).json({ error: 'Failed to get response from ChatGPT API' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '테스트를 실패했습니다.' });
  }
});

// 사용자 id 또는 보호자 id로 기억 점수 전체 조회
const getAllMemoryScores = asyncHandler(async (req, res) => {
  const id = req.params.userId;

  try {
    let user;
    let scores;

    // 주어진 ID가 노인 ID인지 보호자 ID인지 확인
    user = await ElderlyUser.findById(id);
    if (user) {
      // 노인 ID로 조회
      scores = await MemoryScore.find({ userId: user._id });
    } else {
      // 보호자 ID로 노인 찾기
      const guardian = await GuardianUser.findById(id);
      if (!guardian) {
        return res.status(404).json({ message: '사용자 또는 보호자를 찾을 수 없습니다.' });
      }

      // 보호자에 해당하는 노인의 점수 조회
      const elderlyUsers = await ElderlyUser.find({ guardianId: guardian._id });

      const elderlyUserIds = elderlyUsers.map(user => user._id);
      scores = await MemoryScore.find({ userId: { $in: elderlyUserIds } });
    }

    if (!scores || !scores.length) {
      return res.status(404).json({ message: '기억 테스트 내역이 없습니다.' });
    }

    res.status(200).json(scores);

  } catch (error) {
    res.status(500).json({ message: '기억 점수 전체 조회에 실패했습니다.' });
  }
});

module.exports = { startMemoryTest, getAllMemoryScores };
