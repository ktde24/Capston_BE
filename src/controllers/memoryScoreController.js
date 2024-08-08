// 0807
const asyncHandler = require('express-async-handler');
const { memoryTest } = require('../utils/chatgpt');
const ElderlyUser = require('../models/ElderlyUser');
const GuardianUser = require('../models/GuardianUser');
const MemoryScore=require('../models/MemoryScore');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

//테스트 대화 저장용
const conversations=[];

//기억 테스트 시작
const startMemoryTest=asyncHandler(async (req, res) =>{
  const userId=req.params.userId;

  const msg=req.body.message;

  if(msg){//사용자 입력
    conversations.push({
      role: "user",
      content: msg,
    });    
  }

  //테스트 날짜 가져오기
  let today=new Date();

  let diaryList=[];

  try { 
    //사용자 확인
    const user = await ElderlyUser.findOne({id: userId});
    if (!user) {
      console.log('사용자를 찾을 수 없습니다.');
      return;
    }

    //기억 점수용 보호자.사용자 정보 가져오기
    const userInfo = await GuardianUser.findOne({ userId: user.guardianId}, 'address birth job elderlyName');

    if (!userInfo) {
      console.log('사용자 정보를 불러오는 데 실패했습니다.');
      return;
    }

    //3일치 일기 diaryList에 저장
    for (let i = 0; i < 3; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
    
      //날짜의 시작과 끝 시간을 설정
      let startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      let endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
      
      //해당 날짜의 일기 가져오기
      let diary = await Diary.findOne({ userId: user.guardianId, date: { $gte: startOfDay, $lte: endOfDay } }, 'diaryId date content');

      if(diary){
        diaryList.push(diary);
      }
    }

    //테스트 생성
    const response=await memoryTest(userInfo, diaryList,conversations);

    if(response){
      res.json(conversations);
      console.log(response);
    }
    else{
      res.status(500).json({'error':'Failed to get response from ChatGPT API'});
    }

    //기억 점수 모델 저장 필요

  } catch (error) {
    console.log(error);
      res.status(500).json({ message: '테스트를 실패했습니다.' });
  }
});

//사용자 id(/:userId)로 기억 점수 전체 조회
const getAllMemoryScores=asyncHandler(async (req, res) => {
  const userId=req.params.userId;

  try {  
    //사용자 확인
    const user = await ElderlyUser.findOne({id:userId});
    if (!user) {
      res.status(500).json({ message: '사용자가 없습니다.' });
      return;
    }
    
    const userObjectId = new mongoose.Types.ObjectId(user._id);
    
    //userId인 사용자의 모든 점수 조회
    const scores = await MemoryScore.find({userId:userObjectId});
    if (!scores) {
      res.status(500).json({ message: '기억 테스트 내역이 없습니다.' });
      return;
    }  

    res.status(200).json(scores);
    
  } catch (error) {
    res.status(500).json({ message: '기억 점수 전체 조회에 실패했습니다.' });
  }
});

module.exports={startMemoryTest,getAllMemoryScores};