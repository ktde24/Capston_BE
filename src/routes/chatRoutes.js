const express=require('express');
const router = express.Router();
const {callChatgpt}=require('../utils/chatgpt');

router.get('/chat',async function(req,res){
  res.render('chat',{
    pass:true,
  });
});

router.post('/chat',async function(req,res){
  //사용자 msg 가져오기
  const msg=req.body.message;

  if(!msg){//사용자 입력 없음
    return res.status(400).send({error: '메시지를 입력하세요.'});
  }
  
  //응답 가져오기
  const response=await callChatgpt(msg);

  if(response){
    res.json({'response':response});
    console.log(response);
  }
  else{
    res.status(500).json({'error':'Failed to get response from ChatGPT API'});
  }
});

module.exports = router;