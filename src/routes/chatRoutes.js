const express=require('express');
const router = express.Router();
const {callChatgpt}=require('../utils/chatgpt');

//대화 상태를 유지용(세션 추가 시 변경 필요)
const conversations = [];

router.get('/',async function(req,res){
  res.send("chat 화면");
});

router.post('/',async function(req,res){
  //사용자 msg 가져오기
  const msg=req.body.message;

  if(!msg){//사용자 입력 없음
    return res.status(400).send({error: '메시지를 입력하세요.'});
  }

  //사용자 응답 추가
  conversations.push({
    role: "user",
    content: msg,
  });

  //응답 가져오기
  const response=await callChatgpt(conversations);

  if(response){
    res.json(conversations);
    console.log(response);
  }
  else{
    res.status(500).json({'error':'Failed to get response from ChatGPT API'});
  }
});

module.exports = router;