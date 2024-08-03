const { generateDiary } = require('../utils/chatgpt');
const ElderlyUser = require('../models/ElderlyUser');
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');

//일기 생성
const makeDiary=asyncHandler(async (ws, message) =>{
  const data = JSON.parse(message);
  const { userId, sessionId } = data;
  try { 
    ws.userId = userId;
    ws.sessionId = sessionId;
    
    //사용자 확인
    const user = await ElderlyUser.findById(userId);
    if (!user) {
      ws.send(JSON.stringify({ type: 'error', message: '사용자를 찾을 수 없습니다.' }));
      return;
    }

    //세션 확인. 세션 가져오기
    const chatSession = await ChatSession.findOne({ userId: userId, sessionId: sessionId});

    if (!chatSession) {
      ws.send(JSON.stringify({ type: 'error', message: '대화 내역을 찾을 수 없습니다.' }));
      return;
    }

    const conversations=chatSession.messages;

    //일기 생성
    const diary=await generateDiary(conversations);
    
    //일기 저장
    //새 일기 인스턴스 생성
    const newDiary = await Diary.create({
      userId: userId,
      content: diary,
    });

    console.log(newDiary);

  } catch (error) {
    res.status(500).json({ message: '일기 생성을 실패했습니다.' });
  }
});

//사용자 id(/:userId)로 일기 전체 조회
const getAllDiaries=asyncHandler(async (req, res) => {
  try {  
    //사용자 확인
    const user = await ElderlyUser.findOne({userId:req.params.id});
    if (!user) {
      ws.send(JSON.stringify({ type: 'error', message: '사용자를 찾을 수 없습니다.' }));
      return;
    }
      
    //userId인 사용자의 모든 일기 조회
    const diaries = await Diary.find({userId:user.userId});
    if (!diaries) {
      ws.send(JSON.stringify({ type: 'error', message: '일기가 없습니다.' }));
      return;
    }  
    res.status(200).json(diaries);
    
  } catch (error) {
    res.status(500).json({ message: '일기 전체 조회에 실패했습니다.' });
  }
});

//일기 id(/:userId/:diaryId)로 특정 일기 조회
const getDiary=asyncHandler(async (req, res) => {
  const { userId, diaryId } = req.params;
  try {  
    //일기 찾기
    const diary = await Diary.findOne({userId:userId, diaryId:diaryId});
    if (!diary) {
      ws.send(JSON.stringify({ type: 'error', message: '일기를 찾을 수 없습니다.'}));
      return;
    }

    res.status(200).json(diary);

  } catch (error) {
    res.status(500).json({ message: '일기 조회에 실패했습니다.' });
  }
});

//일기 id(/:userId/:diaryId)로 일기 삭제
const deleteDiary=asyncHandler(async (req, res) => {
  const { userId, diaryId } = req.params;
  try {
    //일기 삭제
    const result = await Diary.findOneAndDelete({ diaryId: diaryId, userId: userId });

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
  const { userId, diaryId } = req.params;
  const updatedContent = req.body.content; 
  try {
    //일기 수정
    const result = await Diary.findOneAndUpdate(
      { userId: userId, diaryId: diaryId },
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
  }
});

module.exports={makeDiary,getAllDiaries,getDiary,deleteDiary,updateDiary};