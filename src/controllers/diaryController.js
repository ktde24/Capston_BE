// 0805
const asyncHandler = require('express-async-handler');
const { generateDiary } = require('../utils/chatgpt');
const ElderlyUser = require('../models/ElderlyUser');
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

//일기 생성
const makeDiary=asyncHandler(async (req, res) =>{
  //const data = JSON.parse(message);
  //const { userId, sessionId } = data;
  const userId=req.params.userId;
  const sessionId=req.params.sessionId;

  try { 
    //ws.userId = userId;
    //ws.sessionId = sessionId;
    
    //사용자 확인
    const user = await ElderlyUser.findOne({id: userId});
    if (!user) {
      res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
      console.log('사용자를 찾을 수 없습니다.');
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id);

    //세션 확인. 세션 가져오기
    const chatSession = await ChatSession.findOne({ userId: userObjectId, sessionId: sessionId});

    if (!chatSession) {
      res.status(404).json({ message: '대화 내역을 찾을 수 없습니다.' });
      console.log('대화 내역을 찾을 수 없습니다.');
      return;
    }

    const messages=chatSession.messages;

    //일기 생성
    const diary=await generateDiary(messages);
    if(!diary){
      res.status(500).json({ message: '일기 생성을 실패했습니다.' });
      console.log('일기 실패');
      return;
    }
    console.log('일기 생성');
    
    //일기 저장
    //새 일기 인스턴스 생성
    const newDiary = await Diary.create({
      userId: userObjectId,
      content: diary,
    });

    res.status(200).json(newDiary);
    console.log(newDiary);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '일기 생성을 실패했습니다.' });
  }
});

//사용자 id(/:userId)로 일기 전체 조회
const getAllDiaries=asyncHandler(async (req, res) => {
  const userId=req.params.userId;

  try {  
    //사용자 확인
    const user = await ElderlyUser.findOne({id:userId});
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }
    
    const userObjectId = new mongoose.Types.ObjectId(user._id);
    
    //userId인 사용자의 모든 일기 조회
    const diaries = await Diary.find({userId:userObjectId});
    if (!diaries) {
      res.status(404).json({ message: '일기가 없습니다.' });
      return;
    }  

    res.status(200).json(diaries);
    
  } catch (error) {
    res.status(500).json({ message: '일기 전체 조회에 실패했습니다.' });
  }
});

//일기 id(/:userId/:date)로 특정 일기 조회(날짜)
const getDiary=asyncHandler(async (req, res) => {
  const userId= req.params.userId;
  let startDate = req.params.date.trim();//공백문자 제거

  //입력 문자열 YYYYMMDD 형식 가정
  const year = startDate.substring(0, 4);
  const month = startDate.substring(4, 6);
  const day = startDate.substring(6, 8);

  // ISO 형식의 문자열로 변환
  startDate= new Date(`${year}-${month}-${day}T00:00:00Z`);
  
  let endDate=new Date(startDate);
  endDate.setUTCHours(23, 59, 59, 999);

  try {  
    //사용자 확인
    const user = await ElderlyUser.findOne({id:userId});
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findOne({ userId: user._id, date: { $gte: startDate, $lte: endDate } });
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }
    
    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    res.status(200).json(diary);

  } catch (error) {
    res.status(500).json({ message: '일기 조회에 실패했습니다.' });
    console.log(error);
  }
});

//일기 id(/:userId/:diaryId)로 일기 삭제
const deleteDiary=asyncHandler(async (req, res) => {
  const userId= req.params.userId;
  const diaryId = req.params.diaryId.trim();//공백문자 제거

  try {
    //사용자 확인
    const user = await ElderlyUser.findOne({id:userId});
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }
    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    //일기 삭제
    const result = await Diary.findOneAndDelete({ userId: diary.userId, _id: diaryId });

    //삭제된 일기가 없는 경우
    if (!result) {
      return res.status(404).json({ message: '삭제할 수 없는 일기입니다.' });
    }

    res.status(200).json({ message: '일기 삭제 성공', deletedDiary: result });
    
  } catch (error) {
    res.status(500).json({ message: '일기 삭제 실패' });
  }
});

//일기 id(/:userId/:diaryId)로 일기 수정
const updateDiary=asyncHandler(async (req, res) => {
  const updatedContent = req.body.content; 
  const userId= req.params.userId;
  const diaryId = req.params.diaryId.trim();//공백문자 제거
  try {  
    //사용자 확인
    const user = await ElderlyUser.findOne({id:userId});
    if (!user) {
      res.status(400).json({ message: '사용자가 없습니다.' });
      return;
    }

    // 일기 찾기
    const diary = await Diary.findById(diaryId);
    if (!diary) {
      res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
      return;
    }
    
    if (!diary.userId.equals(user._id)) { // 일기는 존재하지만 다른 사용자의 일기인지 확인(objectId라서 equals로 비교)
      console.log(diary.userId);
      console.log(user._id);
      res.status(401).json({ message: '접근 권한이 없는 일기입니다.' });
      return;
    }

    //일기 수정
    const result = await Diary.findOneAndUpdate(
      { userId: diary.userId, _id: diaryId },
      { content: updatedContent },
      { new: true } //new:업데이트된 문서 반환
    );

    //수정한 일기가 없는 경우
    if (!result) {
      return res.status(404).json({ message: '수정할 수 없는 일기입니다.' });
    }

    res.status(200).json({ message: '일기 수정 성공', updatedDiary: result });
    
  } catch (error) {
    res.status(500).json({ message: '일기 수정 실패' });
    console.log(error);
  }
});

module.exports={makeDiary,getAllDiaries,getDiary,deleteDiary,updateDiary};