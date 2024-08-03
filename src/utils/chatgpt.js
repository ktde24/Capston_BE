// 0729
require('dotenv').config();
const { OpenAI } = require("openai");

async function callChatgpt(conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversations,
    });

    // gpt 응답 내용을 assistant로 저장
    conversations.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    return response.choices[0].message.content;

  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

//일기 생성
async function generateDiary(conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversations,
      content: "대화 내용을 바탕으로 사용자의 일기를 생성해줘.",
    });

    return response.choices[0].message.content;

  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

module.exports={callChatgpt,generateDiary};
