// 0908 ver(정지 버튼, 종료 버튼)
// JSON 응답과 Binary 데이터를 별도로 전송하여 클라이언트에서 이를 각각 처리할 수 있도록
// 다시 기존 버전

const { generateDiary } = require("../utils/chatgpt");
const { speechToText } = require("../utils/stt");
const { textToSpeechConvert } = require("../utils/tts");
const ElderlyUser = require("../models/ElderlyUser");
const ChatSession = require("../models/ChatSession");
const Diary = require("../models/Diary");
const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const WebSocket = require('ws'); 

//소담이 먼저 말 걸어줌
async function initMessage(ws,token,sessionId){
  const userId=getUserFromToken(token);

  //대화 세션 찾기
  let chatSession = await ChatSession.findOne({
    userId: userId,
    sessionId:sessionId,
  });

  //기본 시작 멘트
  let introMsg='안녕하세요! 저는 소담이에요! 오늘 어떤 하루를 보내셨나요?';
  //중단 후 재시작 멘트
  if (chatSession) {
    let recentMsg='';
    //마지막 대화가 챗봇의 질문으로 끝남
    if(chatSession.messages.length%2==0){
      recentMsg=chatSession.messages[chatSession.messages.length-1].content;
    }
    introMsg='다시 돌아오셨군요! 이어서 대화를 시작해봐요!'+recentMsg;
    console.log(introMsg);
  }

  let audioContent=await textToSpeechConvert(introMsg);

  ws.send(
    JSON.stringify({
      type: "response",
      userText: '...',
      gptText: introMsg,
      sessionId: sessionId,
    })
  );

  if(audioContent){
    ws.send(audioContent);
  }
}

//token으로 user 찾기
function getUserFromToken(token){
  const secretKey=process.env.JWT_SECRET;

  try{
    //토큰 디코딩
    const decoded=jwt.verify(token,secretKey);
    return decoded.id;
  }catch(err){
    console.error('토큰 검증 실패',err);
    return null;
  }
}

exports.handleWebSocketMessage = async (ws, message) => {
  try {
    if (message.toString().startsWith("{")) {
      const data = JSON.parse(message);
      console.log(data);
      const { token, sessionId } = data;

      const userId=getUserFromToken(token);

      ws.userId = userId;
      // 세션 ID가 이미 있으면 유지하고, 없으면 새로운 세션 ID를 생성
      ws.sessionId = sessionId||ws.sessionId||uuidv4();

      const user = await ElderlyUser.findById(userId);
      if (!user) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "사용자를 찾을 수 없습니다.",
          })
        );
        return;
      }

      //기존 세션 존재 확인
      const today=new Date().toISOString();
      //today: 2024-09-14T10:34:00.590Z
      const year = today.substring(0, 4);
      const month = today.substring(5, 7);
      const day = today.substring(8, 10);
    
      const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

      //해당 날짜, 유저의 기존 세션 확인
      const existingSession = await ChatSession.findOne({
        userId,
        createdAt: {$gte:startDate,$lte:endDate}
      });

      //진행하던 세션 발견
      if(existingSession){
        ws.sessionId=existingSession.sessionId;
      }

      if(data.type == "startConversation"){
        await initMessage(ws, token, ws.sessionId);
        return;
      }

      //대화 세션 종료 확인
      if (data.type == "endConversation") {
        await handleEndConversation(ws, userId);
        return;
      }
    } else if (Buffer.isBuffer(message)) {
      const { userId, sessionId } = ws;
      if (!userId) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "사용자 ID가 설정되지 않았습니다.",
          })
        );
        return;
      }

      const audioBuffer = message;
      const userText = await speechToText(audioBuffer);
      console.log('Converted user text:', userText);

      // 대화 세션 찾기 또는 생성
      let chatSession = await ChatSession.findOne({
        userId: userId,
        sessionId: sessionId,
      });
      if (!chatSession) {
        chatSession = new ChatSession({
          userId: userId,
          sessionId: sessionId,
          messages: [],
        });
      }
      chatSession.messages.push({
        role: "user",
        content: userText,
        timestamp: new Date(),
      });

      const conversations = chatSession.messages;
      const gptResponse = await generateDiary(conversations,userId);

      let audioContent;
      if (gptResponse) {
        audioContent = await textToSpeechConvert(gptResponse);
      }

      await chatSession.save();

      // JSON 응답 전송
      ws.send(
        JSON.stringify({
          type: "response",
          userText,
          gptText: gptResponse,
          sessionId,
        })
      );

      // Binary 응답 전송
      if (audioContent) {
        ws.send(audioContent); // audioContent를 binary 형식으로 전송
      }
    }
  } catch (error) {
    console.error("에러 발생:", error);
    ws.send(
      JSON.stringify({ type: "error", message: "처리 실패: " + error.message })
    );
  }
};

async function handleEndConversation(ws, userId) {
  try {
    console.log(`Ending conversation for user: ${userId}`);

  } catch (error) {
    console.error("Error ending conversation:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "대화 종료 실패: " + error.message,
      })
    );
  }
}

//module.exports={startDiaryChatBot};