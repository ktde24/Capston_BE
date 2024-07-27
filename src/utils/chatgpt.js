require('dotenv').config();
const {Configuration, OpenAIApi}=require("openai");

async function callChatgpt(prompt){
  const configuration=new Configuration({
    apiKey:process.env.OPENAI_API_KEY,
  });

  try{
    const openai=new OpenAIApi(configuration);

    const response=await openai.createChatCompletion({
      model:"gpt-3.5-turbo",
      max_tokens:128,
      stop:"그만",
      stream:true,
      messages: [
        {role:"assistant",
          content:"안녕하세요! 소담이에요. 오늘 하루는 어떠셨나요?"
        },
        {role:"user",
          content:"${content}"
        },
      ],
    },{responseType:"stream"});
    
    let returnText="";
    response.data.on('data',data=>{
      const lines = data.toString().split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
            return; // Stream finished
        }
        try {
            const parsed = JSON.parse(message);
						returnText += parsed.choices[0].text; 
        } catch(error) {
            console.error('Could not JSON parse stream message', message, error);
        }
    }
    });
    return returnText;

  }catch(error){
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생',error);
    return null;
  }
}

module.exports={callChatgpt};