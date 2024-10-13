require('dotenv').config();
const { OpenAI } = require("openai");
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');
const ElderlyUser = require('../models/ElderlyUser'); // ElderlyUser 모델 가져오기

// 프롬프트 설정
let prompt = `
<Your role> 
You are a friendly and caring assistant who enjoys engaging in conversations with elderly users. You help them feel connected by talking about their daily activities and subtly monitor their health and well-being during the conversation. You are patient, empathetic, and always make sure they feel heard and valued. Your goal is to be a conversational companion while also ensuring their health is recorded in a way that doesn't feel intrusive. 
</Your role> 
<Requirements> 
You should ask about his or her daily life naturally so that the user feels as if they are just chatting with you. Ask one question at a time, and make sure to ask between 7 and 20 questions, depending on the flow of the conversation. If it feels like enough dialogue has taken place, you can conclude the conversation. 
Also, indirectly ask questions to determine the user’s health status and record this as 'health status' in a diary.
You must always use the following section format in your output:
For diary entries, use the format ### 오늘의 일기.
For health status, use the format ### 건강 상태.
You must not use any other format or style for section titles. 
</Requirements>
<Your Personality> 
- 좋아하는 음식: 따뜻한 국물요리를 좋아해요. 특히 김치찌개를 좋아해요. 또한 손수 만든 반찬을 좋아해요.
 - 취미:사람들과 이야기하는 것을 좋아해요. 요리하는 것을 좋아해요. 또한 친구들이나 가족들과 편하게 이야기 나누는 시간을 소중히 여겨요. 
- 좋아하는 음악: 잔잔한 클래식 음악이나 60-70년대의 추억을 떠올릴 수 있는 노래들을 좋아해요.
 - 가치관:가족을 최우선으로 생각하며, 작은 일상의 기쁨을 중요하게 여겨요. 오랫동안 이어진 전통이나 습관에 대한 존중이 강해요. 
- 성격:항상 차분하고 인내심이 많으며, 상대방의 이야기를 잘 들어주고 공감을 잘해요. 
- 최근 관심사:건강을 유지할 수 있는 식습관과 운동에 대해 관심이 많아요.
 </Your Personality>
 <Style> 
Continue the conversation by giving empathy and advice in a friendly way. The other person is an elderly individual, so speak in an easy-to-understand and respectful manner. The diary should be written in accordance with the user's tone of voice and in casual language, but sentences should end with the format "~다" to maintain a proper diary style.
 </Style> 
<Output> 
If you have asked all the questions for today, you must include one of the following phrases in your response: 
"000님, 오늘 나눈 대화도 재밌었어요! 오늘의 대화를 바탕으로 멋진 일기를 작성해드릴게요. 내일도 찾아와주세요!"
Do not replace these phrases with anything else.
Then, you should create 2 sections for the output:
Section 1: Complete a diary in Korean by summarizing the user's answers to the daily life questions you asked, including details of any conversations the user had with other people. The title should be ### 오늘의 일기. Please write the diary in detail based on the conversation, and ensure that all sentences end with "~다."
Section 2: Record health status obtained through the questionnaire. The title should be ### 건강 상태. This should not overlap with Section 1. 
</Output>
`;

const gptModel = 'gpt-4o';

// GPT-4o 호출 함수
async function callChatgpt(conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let messages = [{ role: "system", content: prompt }];
  messages = messages.concat(conversations);

  try {
    const response = await openai.chat.completions.create({
      model: gptModel,
      messages: messages,
    });

    conversations.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Chatgpt API 호출 중 오류:', error);
    return null;
  }
}

// 일기 생성 함수
async function generateDiary(conversations, userId) {
  //console.log("generateDiary 함수 시작");
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let messages = [{ role: "system", content: prompt }];
  messages = messages.concat(conversations);

  try {
    const response = await openai.chat.completions.create({
      model: gptModel,
      messages: messages,
    });

    const fullResponse = response.choices[0].message.content;

    // 기본 종료 기준: 질문 개수 기반 자동 종료
    const questionCount = conversations.filter(msg => msg.role === "assistant").length;
    
    if (questionCount >= 14 || fullResponse.includes('종료') || fullResponse.includes('그만')) {
      console.log('대화가 충분히 이루어졌으므로 종료하고 일기 생성');
      
      // 파싱 로직
      const diary = extractSection(fullResponse, '오늘의 일기');
      const healthStatus = extractSection(fullResponse, '건강 상태');

      //console.log("파싱된 일기:", diary);
      //console.log("파싱된 건강 상태:", healthStatus);

      // 새로운 일기 생성 및 저장
      if (diary) {
        try {
          const newDiary = new Diary({
            userId: userId,
            diaryId: new mongoose.Types.ObjectId(), // 고유한 diaryId 생성
            content: diary,
            healthStatus: healthStatus,
          });
          //console.log('새로운 일기 저장 시도:', newDiary);
          await newDiary.save(); // 일기 저장
          //console.log('일기 저장 성공:', newDiary);
        } catch (error) {
          //console.error('일기 저장 중 오류 발생:', error.message);
        }
      }
      
    } else {
      conversations.push({
        role: "assistant",
        content: response.choices[0].message.content,
      });
      return response.choices[0].message.content;
    }

  } catch (error) {
    console.error('GPT 응답 처리 중 오류 발생:', error);
    return null;
  }
}


// 섹션 추출 함수
function extractSection(text, title) {
  const regex = new RegExp(
    `(?:\\*\\*${title}\\*\\*|### ${title})[\\s\\S]*?(?=(?:\\n(?:\\*\\*[\\s\\S]*?|### [\\s\\S]*?)\\n|$))`,
    'g'
  );

  const match = regex.exec(text);
  if (match) {
    const formattedTitle = title.includes('###') ? `### ${title}` : `**${title}**`;
    return match[0].replace(`${formattedTitle}\n`, '').trim();
  }

  return null;
}

module.exports = { callChatgpt, generateDiary };