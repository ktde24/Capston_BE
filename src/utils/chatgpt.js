require('dotenv').config();
const {Configuration, OpenAIApi}=require("openai");

async function callChatgpt(prompt){
  const configuration=new Configuration({
    apiKey:process.env.OPENAI_API_KEY,
  });

  try{
    const openai=new OpenAIApi(configuration);

    const response=await openai.createChatCompletion({
      model:"gpt-4o",
      max_tokens:128,
      messages: [
        {role:"assistant",
          content:"안녕하세요! 소담이에요. 오늘 하루는 어떠셨나요?"
        },
      ],
    });
    return response.data.choices[0].message;
  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

module.exports={callChatgpt};