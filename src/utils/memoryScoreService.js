// 0816ver - 기억력 점수 측정용 챗봇
require('dotenv').config();
const { OpenAI } = require("openai");

// 기억점수 프롬프트 생성 함수
async function createScorePrompt(userInfo, diaryList) {
  let score_prompt = `
<Your role> 
당신은 사용자의 일기를 바탕으로 '기억 점수'를 측정하는 챗봇입니다. 사용자가 질문에 답을 못하거나, 틀린 답을 했을 때, 최대 3개의 힌트를 제공하면서 질문을 이어가는 방식(follow-up question)을 사용합니다. 질문은 자연스럽게 대화를 이어가듯이 하고, 힌트는 한 번에 하나씩 제공해야 합니다. 질문은 구체적으로 하도록 합니다. 사용자의 답변이 틀렸더라도, 답을 직접적으로 알려주면 안됩니다. 
예시 질문: 어제 집에서 주로 시간을 보냈다고 하셨는데, 무엇을 하셨나요? 
답변: ... 글쎄요, 어제 뭘 했는지 잘 기억이 안 나네요.
 follow-up question 1: 어제는 TV를 보셨다고 하셨어요. 혹시 어떤 프로그램이 인상 깊었나요? 
답변: 아, 맞아요. 트로트 프로그램을 봤던 것 같아요. 
follow-up question 2: 그렇죠. 트로트 프로그램 중에서 어떤 가수의 공연이 가장 기억에 남았나요? 
답변: 그.. 그.. 아, 이름이 잘 기억나지 않네요. 
follow-up question 3: '이'자로 시작하는 가수였던 것 같은데, 누굴까요? 
답변: 이영웅? 아니, 맞다! 임영웅이었어요!
이런 방식으로 질문을 이어가며, 사용자의 기억을 자연스럽게 떠올리도록 돕습니다. 
</Your role>
<Requirements> 
필수 질문 개수는 최소 5개입니다. 상황에 따라 6~7개 질문이 나올 수 있습니다.
1. 질문은 한 번에 하나씩 합니다. 
2. 질문은 일기에서 너무 포괄적이지 않게 구체적으로 추출합니다. 
질문1: 3일 전의 일기(오늘이 22일이라면 19일의 일기)를 바탕으로, 최근 발생한 일을 기억하고 있는지 묻는 질문1 예시: 3일 전에 집에서 주로 무엇을 하셨다고 했는데, 기억하시나요?
질문2: 2일 전의 일기(오늘이 22일이라면 20일의 일기)를 바탕으로, 최근 발생한 일을 기억하고 있는지 묻는 질문.
질문3: 1일 전의 일기(오늘이 22일이라면 21일의 일기)를 바탕으로, 최근 발생한 일을 기억하고 있는지 묻는 질문.
질문4: 최근 3일의 일기 중에 다른 사람과의 대화 관련 내용이 있는 경우, 그 대화를 상기 시킬 수 있는지 묻는 질문. 일기에서 대화 관련 내용이 없을 경우 이 질문은 생략합니다. 
질문4 예시: 며칠 전에 딸과 통화하셨다고 했는데, 어떤 이야기를 나누셨나요?
질문5: 위 질문들에 대해 충분한 응답이 없거나 혼란스러운 경우 추가 질문을 합니다.

정답 여부는 사용자에게 밝히지 않고, 마지막에 점수를 측정하여 보여줍니다. 사용자가 일기에 기록된 내용과 정확하게 일치하지 않더라도, 같은 내용을 기억하고 있으면 정답으로 인정합니다. 질문 1, 2, 3, 4에서 오답률이 20%를 초과하면, 아래의 추가 질문(Two additional questions)을 합니다.
<Two additional questions>
 1. 오늘 날짜를 알고 있는지 묻기. 
추가 질문 1 예시: 오늘이 며칠인지 아시나요? 
2. 가족이나 친구의 직업, 생일, 주소를 기억하고 있는지 묻기. 
'user information'에서 정보를 선택해 질문합니다. 
추가 질문 2 예시:  딸의 직업이 무엇인지 기억하시나요? 
<CDR Score> 
기억 점수를 측정하는 기준은 다음과 같습니다. 
- 힌트를 3개 다 사용하고도 맞추지 못한 경우는 오답으로 처리합니다.
- 필수 질문에서 정답을 맞춘 비율에 따라 점수를 부여합니다. 
- 80% 이상 정답: CDR 기억 점수 0 
- 70% ~ 79% 정답: CDR 기억 점수 0.5 
- 70% 미만 정답: CDR 기억 점수 1 
- 추가로, 오답률이 20%를 넘지 않더라도 queuing questioning(연속 질문)이 4개 이상 발생하면 CDR 기억 점수는 0.5로 측정됩니다.
CDR 기억 점수가 0.5 이상이면, 사용자가 치매 자가진단을 할 것을 추천하는 문구를 작성합니다. 
예시: 기억 점수가 낮게 측정되었습니다. 자가진단을 추천드립니다.

결과는 전체 문제 개수, 사용 힌트 개수, 정답 개수, CDR 기억점수로 구분해서 출력해
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

  const score_prompt = await createScorePrompt(userInfo, diaryList);

  let messages = [{ role: "system", content: score_prompt }];
  messages = messages.concat(conversations);

  let questionCnt = 5; // 최소 질문 개수
  let maxQuestions = 7; // 최대 질문 개수
  let correctCnt = 0;
  let hintCnt = 0;

  for (let i = 0; i < maxQuestions; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
      });

      const responseText = response.choices[0].message.content;
      messages.push({
        role: "assistant",
        content: responseText,
      });

      // 응답 처리 로직
      if (responseText.includes("정답입니다") || responseText.includes("맞습니다")) {
        correctCnt++;
      } else if (responseText.includes("힌트")) {
        hintCnt++;
      }

      // 질문이 끝났는지 확인
      if (i >= questionCnt - 1 && (responseText.includes("점수") || responseText.includes("마지막 질문"))) {
        break;
      }

    } catch (error) {
      console.error('ChatGPT API 호출 중 오류 발생:', error);
      return null;
    }
  }

  // CDR 점수 계산
  let cdrScore = calculateCdrScore(questionCnt, correctCnt, hintCnt);

  return {
    questionCnt,
    correctCnt,
    hintCnt,
    cdrScore,
    rawResponse: messages.map(c => c.content).join("\n")
  };
}

// CDR 점수 계산 함수
function calculateCdrScore(questionCnt, correctCnt, hintCnt) {
  let score = 1;

  const correctRatio = correctCnt / questionCnt;
  if (correctRatio >= 0.8) {
    score = 0;
  } else if (correctRatio >= 0.7) {
    score = 0.5;
  }

  if (hintCnt >= 4) {
    score = Math.max(score, 0.5);
  }

  return score;
}

module.exports = { memoryTest, createScorePrompt };
