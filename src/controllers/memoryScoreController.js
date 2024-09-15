// 기억점수 측정용(웹소켓 통신 이용)
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { speechToText } = require("../utils/stt");
const { textToSpeechConvert } = require("../utils/tts");
const { memoryTest, calculateCdrScore } = require('../utils/memoryScoreService');
const ElderlyUser = require('../models/ElderlyUser');
const MemoryScore = require('../models/MemoryScore');
const Diary = require('../models/Diary');
const GuardianUser = require('../models/GuardianUser');

let userConversations = {}; // 사용자별로 conversations를 관리하는 객체

// WebSocket 서버 시작
function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('클라이언트가 WebSocket에 연결되었습니다.');
    let isAuthenticated = false;
    let userId = null;

    ws.on('message', async (message) => {
      const receivedMessage = message.toString();  // Buffer를 문자열로 변환
      console.log('서버가 받은 메시지:', receivedMessage);  // 메시지 로그 추가
      try {
        if (!isAuthenticated && typeof receivedMessage === 'string') {
          // JWT 토큰 인증 처리
          const parsedMessage = JSON.parse(receivedMessage);
          console.log('파싱된 메시지:', parsedMessage);  // 파싱된 메시지 로그 추가
          console.log('받은 토큰:', parsedMessage.token);  // 토큰 로그 추가

          if (parsedMessage.type === 'auth') {
            let token = parsedMessage.token;

            if (token && token.startsWith('Bearer ')) {
              token = token.split(' ')[1];
              console.log("최종 토큰 값:", token);  // 토큰이 올바르게 파싱되었는지 확인
            }

            // JWT 검증
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
              if (err) {
                console.log("Invalid token:", err);  // JWT 검증 실패 로그 추가
                ws.send(JSON.stringify({ error: 'Invalid token' }));
                ws.close();
              } else {
                console.log("Token verified successfully:", decoded);
                isAuthenticated = true;
                userId = decoded.id;  // 확인: JWT 토큰에서 userId를 어떻게 저장했는지 확인
                ws.send(JSON.stringify({ message: 'Authenticated' }));

                // 챗봇의 첫 인사말 전송
                const greetingMessage = "안녕하세요! 소담이에요, 이제 기억 점수 측정을 시작해볼까요?";
                userConversations[userId] = [{ role: 'assistant', content: greetingMessage }];
                ws.send(JSON.stringify({
                  conversations: userConversations[userId],
                  messageFromChatGPT: greetingMessage
                }));

                // TTS 변환 및 음성 전송
                textToSpeechConvert(greetingMessage).then(ttsResponse => {
                  if (ttsResponse && Buffer.isBuffer(ttsResponse)) {
                    ws.send(ttsResponse); // 음성 데이터를 WebSocket을 통해 전송
                  } else {
                    console.error("TTS 변환 실패:", ttsResponse);
                    ws.send(JSON.stringify({ error: 'TTS 변환에 실패했습니다.' }));
                  }
                });
              }
            });
          }
        } else if (isAuthenticated && Buffer.isBuffer(message)) {
          console.log("음성 데이터 수신");  // 음성 데이터 수신 로그
          
          if (!userId) {
            console.log("userId가 설정되지 않았습니다.");
            ws.send(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }));
            return;
          }

          // 음성 데이터 처리 (Buffer 형태로 전송된 음성 파일 처리)
          const user = await ElderlyUser.findById(userId);
          if (!user) {
            console.log("userId로 ElderlyUser를 찾지 못했습니다. userId:", userId); // 추가 로그
            ws.send(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }));
            return;
          }

          const guardian = await GuardianUser.findOne({ phone: user.guardianPhone });
          if (!guardian) {
            ws.send(JSON.stringify({ error: '보호자를 찾을 수 없습니다.' }));
            return;
          }

          // 사용자 정보
          const userInfo = {
            elderlyName: user.name,
            guardianPhone: guardian.phone,
            address: guardian.address,
            birth: guardian.birth,
            job: guardian.job,
          };

          // 대화 기록이 없으면 초기화
          if (!userConversations[userId]) {
            userConversations[userId] = [];
          }
          let conversations = userConversations[userId];

          // 음성 데이터를 텍스트로 변환 (STT) 후, 빈 문자열을 검사
          const userTextFromAudio = await speechToText(message);
          if (userTextFromAudio.trim().length > 0) {  // 빈 문자열이 아닌 경우에만 추가
              conversations.push({ role: 'user', content: userTextFromAudio });
          } else {
              console.log("음성 인식 결과가 비어 있습니다.");
          }

          // 최근 3일간의 일기 가져오기
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const diaryList = [];
          for (let i = 3; i > 0; i--) {
            let targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);

            let startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            let endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            let diary = await Diary.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
            if (diary) diaryList.push(diary);
          }

          if (diaryList.length != 3) {
            ws.send(JSON.stringify({ error: '최근 3일 동안의 일기를 찾을 수 없습니다.' }));
            return;
          }

          
          // 기억 테스트 진행 후 응답 처리
          const response = await memoryTest(userInfo, diaryList, conversations);
          const responseText = response.content.trim();
          if (responseText.length > 0) {  // 빈 문자열이 아닌 경우에만 추가
              conversations.push({ role: 'assistant', content: responseText });
          } else {
              console.log("챗봇 응답이 비어 있습니다.");
          }
          
          // 저장 전 conversations의 각 항목 확인
          const isValidConversations = conversations.every(conv => conv.content && conv.content.trim().length > 0);
          if (!isValidConversations) {
              console.error("대화 내역에 유효하지 않은 항목이 있습니다.");
              ws.send(JSON.stringify({ error: '대화 내용에 오류가 있습니다.' }));
              return;
          }

          // TTS 변환
          const ttsResponse = await textToSpeechConvert(responseText);
          console.log("TTS 변환된 음성 데이터:", ttsResponse);

          if (ttsResponse && Buffer.isBuffer(ttsResponse)) {
            console.log("TTS 변환된 데이터가 Buffer입니다.");
            ws.send(ttsResponse); // 음성 데이터를 WebSocket을 통해 전송
          } else {
            console.error("TTS 변환에 실패했거나 Buffer가 아닙니다. 응답:", ttsResponse);
            ws.send(JSON.stringify({ error: 'TTS 변환에 실패했습니다.' }));
          }

          // 응답 메시지와 함께 전송
          ws.send(JSON.stringify({
            conversations: conversations,
            messageFromChatGPT: responseText,
            nextAction: "사용자의 응답을 기다리고 있습니다."
          }));

          // 테스트 완료 여부 확인
          if (response.isTestCompleted || response.content.includes('결과를 알려드릴게요')) {
            const questionCnt = parseInt(response.content.match(/전체 질문 개수: (\d+)/)[1]);
            const correctCnt = parseInt(response.content.match(/정답 개수: (\d+)/)[1]);
            const hintCnt = parseInt(response.content.match(/사용된 힌트 개수: (\d+)/)[1]);

            const diaryIds = diaryList.map(diary => diary._id);
            const { correctRatio, score: cdrScore } = calculateCdrScore(questionCnt, correctCnt, hintCnt);

            // conversations에서 빈 content가 있는 대화 제거
            const filteredConversations = conversations.filter(conv => conv.content && conv.content.trim() !== '');

            const memoryScore = new MemoryScore({
              userId: user._id,
              diaryIds: diaryIds,
              questionCnt: questionCnt,
              hintCnt: hintCnt,
              correctCnt: correctCnt,
              correctRatio: correctRatio,
              cdrScore: cdrScore,
              conversations: filteredConversations // 수정된 부분
            });

            try {
              await memoryScore.save();
              console.log('MemoryScore saved successfully:', memoryScore);
            } catch (error) {
              console.error('Failed to save MemoryScore:', error);
              ws.send(JSON.stringify({ error: '기억 점수 저장 중 오류가 발생했습니다.' }));
              return; // 오류가 발생하면 이후 프로세스 중단
            }

            let recommendationMessage = '';
            if (cdrScore == 0.5 || cdrScore == 1) {
              recommendationMessage = "CDR 기억점수가 낮습니다. 자가진단을 추천드립니다.";
            } else {
              recommendationMessage = "축하합니다! 좋은 기억력을 가지고 계시네요.";
            }

            // 테스트가 완료되었을 때 추가 정보 전송
            ws.send(JSON.stringify({
              message: '기억 테스트가 완료되었습니다.',
              cdrScore: cdrScore,
              correctRatio: correctRatio,
              questionCnt: questionCnt,
              hintCnt: hintCnt,
              correctCnt: correctCnt,
              recommendation: recommendationMessage,
              nextAction: '테스트가 종료되었습니다.'
            }));
          }
        }
      } catch (error) {
        console.error('기억 테스트 중 오류 발생:', error);
        ws.send(JSON.stringify({ error: '기억 테스트 중 오류가 발생했습니다.' }));
      }
    });

    // WebSocket 연결이 닫힐 때 처리
    ws.on('close', () => {
      console.log('WebSocket connection closed.');
    });
  });
}

// WebSocket 서버를 시작하는 함수를 내보내기
module.exports = { startWebSocketServer };
