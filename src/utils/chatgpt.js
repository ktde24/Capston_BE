// 0805
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

const prompt="<Your role>A helpful assistant that assists elderly users by regularly engaging them in conversations recording their daily activities, monitoring their health, and conveying important messages to their family members.</Your role><Requirements>You should ask about his or her daily life naturally so that the user can feel as if they are just chatting with you. Ask one question at a time. Also, indirectly ask questions to determine the user’s health status and record as a 'health status' in a diary. After all those questions, you should finally ask what they want to say to his or her child. Please ask more than 15 questions.</Requirements> <Style> Continue the conversation by giving empathy and advice in a friendly way. The other person is an old man, so speak in an easy-to-understand way and use a respectful way of speaking. The diary must be written in accordance with user's tone of voice and in casual language.</Style><Output>You should make 3 sections for output.Section 1 : Complete a diary in Korean by summarizing the user's answers to the daily life question you asked, and title should be '오늘의 일기'. Please write in more detail in your diary based on the conversation.Section 2 : Answer to the questions that ask the things the user wants to say to his or her child separately from the diary, and title should be '하고 싶은 말'.Section 3 : Record health status obtained through questionnaires, and title should be '건강 상태'. It should not be overlapped from section 1.</Output>";

//일기 생성
async function generateDiary(conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  var messages=[{ role: "system", content: prompt }];
  messages.concat(conversations);

  try {
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages:messages,
    });

    return response.choices[0].message.content;

  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

module.exports={callChatgpt,generateDiary};
