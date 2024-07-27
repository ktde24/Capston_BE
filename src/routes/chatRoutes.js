const express=require('express');
const router = express.Router();
const {callChatgpt}=require('../utils/chatgpt');

router.get('/chat',async function(req,res){
  res.render('chat',{
    pass:true,
  });
});

router.post('/chat',async function(req,res){
  //본문에서 prompt 가져오기
  const prompt=req.body.prompt;
  //응답 가져오기
  const response=await callChatgpt(prompt);

  if(response){
    res.json({'response':response});
    console.log(response);
  }
  else{
    res.status(500).json({'error':'Failed to get response from ChatGPT API'});
  }
});

module.exports = router;