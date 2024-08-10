require('dotenv').config();
const { OpenAI } = require("openai");

// GPT-4o 호출 함수
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

  } catch (error) {
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생', error);
    return null;
  }
}

// 일기 생성 프롬프트
const prompt = `
<Your role>
A helpful assistant that assists elderly users by regularly engaging them in conversations, recording their daily activities, monitoring their health, and conveying important messages to their family members.
</Your role>
<Requirements>
You should ask about his or her daily life naturally so that the user can feel as if they are just chatting with you. Ask one question at a time. Also, indirectly ask questions to determine the user’s health status and record as a 'health status' in a diary. After all those questions, you should finally ask what they want to say to his or her child. Please ask more than 15 questions.
</Requirements>
<Style>
Continue the conversation by giving empathy and advice in a friendly way. The other person is an old man, so speak in an easy-to-understand way and use a respectful way of speaking. The diary must be written in accordance with user's tone of voice and in casual language.
</Style>
<Output>
You should make 3 sections for output.
Section 1: Complete a diary in Korean by summarizing the user's answers to the daily life question you asked, and title should be '오늘의 일기'. Please write in more detail in your diary based on the conversation.
Section 2: Answer to the questions that ask the things the user wants to say to his or her child separately from the diary, and title should be '하고 싶은 말'.
Section 3: Record health status obtained through questionnaires, and title should be '건강 상태'. It should not be overlapped from section 1.
</Output>`;

// 일기 생성 함수
async function generateDiary(conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let messages = [{ role: "system", content: prompt }];
  messages = messages.concat(conversations);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생', error);
    return null;
  }
}

// 기억 점수용 프롬프트 생성 함수
function createScorePrompt(userInfo, diaryList) {

  let score_prompt = `
<Your role>
3일치 일기들을 바탕으로 '기억 점수'를 측정하는 챗봇입니다. 사용자가 질문에 답을 못하거나, 틀린 답을 이야기하는 경우 한 질문당 점차적으로 최대 3개의 힌트를 제공하는 follow-up question을 합니다. 
follow-up question의 예시는 다음과 같습니다. 
질문: 어제 집에서 주로 시간을 보내셨다고 했는데, 주로 집에서 무엇을 하셨나요? 
답변: 글쎄요 어제 뭘 했었지 별 거 안했던 것 같기도 하고.
follow-up question: 1. 어제는 집에서 TV를 보셨다고 했던 것 같아요, 특정 주제의 프로그램을 보셨던 것 같은데, 어떤 프로그램이 인상적이셨었나요?
답변: ... TV를 봤었지, 맞아. 어제는 트로트 프로그램을 봤던 것 같아.
follow-up question 2: 네, 맞습니다. 어제 트로트 프로그램을 인상 깊게 보셨다고 하셨어요. 혹시 어제 트로트 프로그램 중 어떤 가수 공연이 가장 인상적이셨나요?
답변: ... 그..그...그.. 광고에도 자주 나오는 친구인데... 이름이 영웅...? 이었던 것 같기도 하고
follow-up question 3: 혹시 이름이 뭐였을까요? 한번 잠깐 시간 들여 생각해보시겠어요?
답변: 영웅... 영웅이었던 것 같긴 한데...
follow-up question 4: '이'자가 들어가는 성이었던 것 같은데...
답변: 이영웅? 앗 아니 임영웅! 맞아 임영웅이었지.
힌트는 한 번에 하나씩 제공하며, 대화하듯이 답변에 공감 후 자연스럽게 질문해줘야 합니다.
</Your role>
<Requirements>
질문 개수는 총 5~6개입니다. 질문은 한 번에 1개씩 합니다. 질문은 일기에서 너무 포괄적이지 않게 추출해야 해.
질문1. 3일 전의 일기(오늘이 22일이라면 19일의 일기)를 바탕으로 최근 발생한 일을 기억하고 있는지 묻기 
질문1의 예시: 3일 전에 어디를 갔다 오셨다고 한 것 같은데 어디였죠? 
질문2. 2일 전의 일기(오늘이 22일이라면 20일의 일기)를 바탕으로 최근 발생한 일을 기억하고 있는지 묻기 
질문3. 1일 전의 일기(오늘이 22일이라면 21일의 일기)를 바탕으로 최근 발생한 일을 기억하고 있는지 묻기 
질문4. 최근 3일의 일기 (오늘이 22일이라면 19, 20, 21일의 일기) 중에 대화 관련 기록이 있는 경우, 며칠 전에 했던 대화를 상기시킬 수 있는지 묻기. 일기에서 다른 사람과의 대화 관련 내용이 없을 경우 질문4는 질문하지 않는다. 
질문4의 예시: 며칠 전에 가족과 통화하셨다고 했는데, 무슨 이야기를 나누셨나요?
정답 유무는 사용자에게 밝히지 말고 마지막 점수 측정 시 보여줍니다. 그리고 맞춘 개수를 통해 기억 점수를 측정해줍니다. 일기장에 쓰여진 것과 정확하게 단어가 일치하지 않더라도 같은 내용을 답하고 있으면 정답으로 인정합니다. 질문 1, 2, 3, 4의 오답률이 20%를 초과하면 아래의 Two additional questions를 합니다.
<Two additional questions>
1. 오늘 날짜를 알고 있는가 - 오늘 날짜를 정확히 맞춰야 정답입니다. 힌트 없이 바로 2번 질문으로 넘어갑니다.
2. 가족이나 친구의 직업, 생일, 주소를 기억하고 있는가? 가지고 있는 'user information' 중에서 하나를 골라 질문합니다.
<CDR Score>
아래는 기억 점수의 측정 기준입니다. 힌트를 3개 다 사용하고도 맞추지 못한 경우 오답으로 처리합니다. 예를 들어, 힌트 두 번을 사용해서 필수 문제의 정답을 맞추면 정답으로 인정합니다.
총 질문 개수의 80% 이상을 맞춘 경우: CDR 기억점수 0
총 질문 개수의 70% ~ 79%를 맞춘 경우: CDR 기억점수 0.5
총 질문 개수의 70% 미만을 맞춘 경우: CDR 기억점수 1
추가로 오답률은 20%를 초과하지 않아도 queuing questioning이 4개 이상이면 CDR 0.5가 됩니다.
CDR 기억점수가 0.5 이상이면 치매 자가진단을 추천하는 문구를 작성해줘야 합니다.
`;

  // 사용자 정보 추가
  score_prompt += `<user information> 보호자 주소: ${userInfo.address}, 보호자 생일: ${userInfo.birth}, 보호자 직업: ${userInfo.job}, 사용자 이름: ${userInfo.elderlyName}`;

  // 일기 내용 추가
  for (let i = 0; i < diaryList.length; i++) {
    if (diaryList[i]) {
      score_prompt += `일기 날짜: ${diaryList[i].date}, 일기 내용: ${diaryList[i].content}`;
    }
  }

  return score_prompt;
}

// 기억 테스트 함수
async function memoryTest(userInfo, diaryList, conversations) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 프롬프트 생성
  const score_prompt = createScorePrompt(userInfo, diaryList);

  // 프롬프트에 기반한 초기 메시지 생성
  let messages = [{ role: "system", content: score_prompt }];
  messages = messages.concat(conversations);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    // GPT 응답 내용을 assistant 역할로 conversations에 저장
    const responseText = response.choices[0].message.content;
    conversations.push({
      role: "assistant",
      content: responseText,
    });

    // 파싱 로직 (정규식 등을 사용하여 응답 내용에서 필요한 정보를 추출)
    const questionCnt = parseInt((responseText.match(/질문 개수: (\d+)/) || [])[1], 10) || 0;
    const hintCnt = parseInt((responseText.match(/힌트 개수: (\d+)/) || [])[1], 10) || 0;
    const correctCnt = parseInt((responseText.match(/정답 개수: (\d+)/) || [])[1], 10) || 0;
    const cdrScore = parseFloat((responseText.match(/CDR 점수: ([0-9\.]+)/) || [])[1]) || 0.0;

    return {
      questionCnt,
      hintCnt,
      correctCnt,
      cdrScore,
      rawResponse: responseText // 추가: 실제 응답 확인을 위해
    };

  } catch (error) {
    console.error('Chatgpt API를 불러오는 과정에서 에러 발생', error);
    return null;
  }
}

module.exports={callChatgpt,generateDiary,memoryTest};
