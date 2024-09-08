// 0807 ver(대화, 세션 관리)
// JSON 응답과 Binary 데이터를 별도로 전송하여 클라이언트에서 이를 각각 처리할 수 있도록

const { generateDiary } = require("../utils/chatgpt");
const { speechToText } = require("../utils/stt");
const { textToSpeechConvert } = require("../utils/tts");
const ElderlyUser = require("../models/ElderlyUser");
const ChatSession = require("../models/ChatSession");
const Diary = require("../models/Diary");
const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose');

exports.handleWebSocketMessage = async (ws, message) => {
  try {
    if (message.toString().startsWith("{")) {
      const data = JSON.parse(message);
      const { userId, sessionId } = data;

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


      //대화 세션 종료 확인
      if (data.type == "endConversation") {
        try {
          console.log(ws.sessionId);
          // 사용자와 세션을 찾거나 생성
          let chatSession = await ChatSession.findOne({ sessionId:ws.sessionId });

          if(!chatSession){
            console.log('해당 세션이 없습니다.');
            return;
          }

          const diaryData = await generateDiary(chatSession.messages, 1);

          // 새로운 일기 생성 및 저장
          if (diaryData) {
            const newDiary = new Diary({
              userId: userId,
              diaryId: new mongoose.Types.ObjectId(), // 명시적으로 고유한 diaryId 생성
              content: diaryData.diary,
              messageToChild: diaryData.messageToChild,
              healthStatus: diaryData.healthStatus,
            });
            await newDiary.save();
            console.log(newDiary);
            await handleEndConversation(ws, userId,newDiary);
            return;
          }
        } catch (error) {
          console.error("일기 생성 중 오류 발생:", error);
          ws.send(JSON.stringify({ error: { code: 500, message: "오류 발생" } }));
        }
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
      const gptResponse = await generateDiary(conversations, 0);

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

async function handleEndConversation(ws, userId,newDiary) {
  try {
    console.log(`Ending conversation for user: ${userId}`);
    ws.send(JSON.stringify(newDiary));

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
