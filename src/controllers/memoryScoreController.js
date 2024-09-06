// 0813ver(일한 날짜에 동일한 사용자가 두 번 이상 기억 점수를 생성하지 못하도록)

const asyncHandler = require('express-async-handler');
const { memoryTest } = require('../utils/memoryScoreService');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');
const MemoryScore = require('../models/MemoryScore');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// 기억 테스트 시작
const startMemoryTest = asyncHandler(async (req, res) => {
  const userId = req.params.userId.trim();
  const msg = req.body.message;

  let conversations = []; // 테스트 대화 저장용
  if (msg) {
    conversations.push({
      role: "user",
      content: msg,
    });
  }

  let today = new Date(2024,7,27);
  //let today = new Date();
  console.log(today);
  let diaryList = [];

  try {
    // 사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    console.log(user);

    // 보호자 정보 가져오기
    const guardian = await GuardianUser.findOne({ phone: user.guardianPhone });
    if (!guardian) {
      return res.status(404).json({ message: '보호자 정보를 불러오는 데 실패했습니다.' });
    }

    console.log(guardian);

    // 3일치 일기 가져오기
    for (let i = 0; i < 3; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      console.log(currentDate);

      let startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      let endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      let diary = await Diary.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
      if (diary) {
        diaryList.push(diary);
      }
    }

    console.log(diaryList);

    // 이미 오늘의 기억 점수가 기록되었는지 확인
    const existingMemoryScore = await MemoryScore.findOne({
      userId: user._id,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingMemoryScore) {
      return res.status(400).json({ message: '오늘의 기억 점수는 이미 생성되었습니다.' });
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
        diaryIds: diaryList.map(diary => diary._id),
      });
      await memoryScore.save();

      res.json({ conversations, response });
    } else {
      res.status(500).json({ error: 'ChatGPT API로부터 응답을 받지 못했습니다.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '기억 테스트를 실패했습니다.' });
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
      const guardian = await GuardianUser.findOne({ phone: id });
      if (!guardian) {
        return res.status(404).json({ message: '사용자 또는 보호자를 찾을 수 없습니다.' });
      }

      // 보호자에 해당하는 노인의 점수 조회
      const elderlyUsers = await ElderlyUser.find({ guardianPhone: guardian.phone });

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

module.exports={startMemoryTest,getAllMemoryScores};
