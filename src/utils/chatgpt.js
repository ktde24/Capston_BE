require('dotenv').config();
const {OpenAI}=require("openai");

async function callChatgpt(prompt){
 
  const openai = new OpenAI({
    user: process.env.OPENAI_API_KEY,
  });

  try{
    const response=await openai.chat.completions.create({
      model:"gpt-4o",
      messages: [
        {
          role:"user",
          content:prompt,
        },
      ],
    });
    return response.choices[0].message.content;
  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

module.exports={callChatgpt};