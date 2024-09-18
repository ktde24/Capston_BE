// 0816ver - 일기, 컨디션, 자녀에게 전하고 싶은 말 기록용 챗봇
require('dotenv').config();
const { OpenAI } = require("openai");
const ChatSession = require('../models/ChatSession');
const Diary = require('../models/Diary');
const mongoose = require('mongoose');

// 프롬프트 설정
let prompt = `
<Your role> A helpful assistant that assists elderly users by regularly engaging them in conversations, recording their daily activities, and monitoring their health.
</Your role>

<Requirements> You should ask about his or her daily life naturally so that the user feels as if they are just chatting with you. Ask one question at a time, and make sure to ask between 7 and 20 questions, depending on the flow of the conversation. If it feels like enough dialogue has taken place, you can conclude the conversation. Also, indirectly ask questions to determine the user’s health status and record this as 'health status' in a diary.
Always use the following section format in your output:

For diary entries, use the format ### 오늘의 일기.
For health status, use the format ### 건강 상태.
You must not use any other format or style for section titles. 
</Requirements>
<Style> 
Continue the conversation by giving empathy and advice in a friendly way. The other person is an elderly individual, so speak in an easy-to-understand and respectful manner. The diary should be written in accordance with the user's tone of voice and in casual language, but sentences should end with the format "~다" to maintain a proper diary style. 
</Style>
<Output> 
If you have asked all the questions for today, you must include the statement "오늘의 대화가 완료되었습니다. 멋진 일기를 만들어 드릴 테니, 꼭 확인해 주세요!" in your response. Do not replace this phrase with anything else.
Then you should create 2 sections for the output.
Section 1: Complete a diary in Korean by summarizing the user's answers to the daily life questions you asked, including details of any conversations the user had with other people. The title should be ### 오늘의 일기. Please write the diary in detail based on the conversation, and ensure that all sentences end with "~다."
Section 2: Record health status obtained through the questionnaire. The title should be ### 건강 상태. This should not overlap with Section 1.
</Output>

`;

const gptModel='gpt-4o-mini';

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

    // gpt 응답 내용을 assistant로 저장
    conversations.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생', error);
    return null;
  }
}

// 일기 생성 함수
async function generateDiary(conversations,userId) {
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

    //gpt 자체 생성(종료멘트)-> 일기 생성 후 저장
    if(fullResponse.includes('오늘의 대화가 완료되었습니다')){
      console.log('오늘의 질문 종료!');
      console.log(fullResponse);
      // 파싱 로직
      const diary = extractSection(fullResponse, '오늘의 일기');
      const healthStatus = extractSection(fullResponse, '건강 상태');

      console.log("오늘의 일기:", diary);
      console.log("건강 상태:", healthStatus);

      //return { diary, messageToChild, healthStatus };

      // 새로운 일기 생성 및 저장
      if (diary) {
        const newDiary = new Diary({
          userId: userId,
          diaryId: new mongoose.Types.ObjectId(), // 명시적으로 고유한 diaryId 생성
          content: diary,
          healthStatus: healthStatus,
        });
        await newDiary.save();
        console.log(newDiary);
        return '오늘의 대화가 완료되었습니다. 멋진 일기를 만들어 드릴 테니, 꼭 확인해 주세요!';
      }
    }

    else{//대화 진행
      // gpt 응답 내용을 assistant로 저장
      conversations.push({
        role: "assistant",
        content: response.choices[0].message.content,
      });
    
      return response.choices[0].message.content;
    }

  } catch (error) {
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생', error);
    return null;
  }
}

function extractSection(text, title) {
  const regex = new RegExp(
    `(?:\\*\\*${title}\\*\\*|### ${title})[\\s\\S]*?(?=(?:\\n(?:\\*\\*[\\s\\S]*?|### [\\s\\S]*?)\\n|$))`,
    'g'
  );

  const match = regex.exec(text);
  if (match) {
    // 제목,공백 제거
    const formattedTitle = title.includes('###') ? `### ${title}` : `**${title}**`;
    return match[0].replace(`${formattedTitle}\n`, '').trim();
  }
  
  return null;
}

module.exports = { callChatgpt, generateDiary };