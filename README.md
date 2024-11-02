# BE
졸업프로젝트 백엔드 레포입니다

# 캡스톤디자인 스타트 05팀(그린나래)


### Members😄
- 프로젝트 기간: 24.03~
- 김여은: FE(리더), BE
- 우정아: BE(리더), AI
- 장서연: AI(리더), FE
<br><br>

### 프로젝트 소개📂
✔️ 서비스명: 소담 - 소리로 담는 나만의 작은 이야기

✔️ 주제: 노인 인지 기능 저하 예방을 위한 GPT-4o 기반 음성 챗봇 및 일기 생성 서비스

✔️ 부제: 대화로 기억을 지키는 치매 예방 솔루션

✔️ 타겟 고객: 떨어져 사는 만 65세 이상의 부모님을 둔 자녀 (수정?)
<br><br>

### 기능 소개📂
✔️ 기능1: AI와의 음성 채팅<br>
: 사용자가 설정한 시간에(ex. 저녁 7시) 규칙적으로 하루에 있었던 일, 수면 시간, 섭취 음식, 약 복용 여부 등 여러 질문들을 챗봇이 음성으로 제공

✔️ 기능2: 일기 생성<br>
: 챗봇과 나눈 대화를 바탕으로 요약된 일기 생성

✔️ 기능3: report 제공<br>
: 챗봇과 나눈 대화를 바탕으로 report 제공.<br>
: 리포트에는 감정 분석 결과, 컨디션, 기억점수 그래프가 포함<br>

✔️ 기능4: 기억점수 측정 및 치매 자가진단<br>
: 챗봇과의 음성 대화를 통해 3일간의 일기 데이터를 바탕으로 기억점수 측정<br>
: TTS 기능을 활용한 자가진단(KDSQ, PRMQ)을 통해 추가적인 인지기능 저하 체크<br>


노인 사용자/ 보호자 사용자의 기능 비교<br>

![image](https://github.com/user-attachments/assets/040638f8-0479-4595-9aad-38cc014b6a94)

<br><br>
##############수정################
### 사용 기술 및 프레임워크💻
- gpt-4o: https://openai.com/index/hello-gpt-4o/
- Google cloud Text-to-Speech: https://cloud.google.com/text-to-speech?hl=ko
- Google cloud Speech-to-Text: https://cloud.google.com/speech-to-text?hl=ko
- Flutter(FE) https://flutter.dev/
- node.js(BE)
-  koBERT : https://github.com/SKTBrain/KoBERT


### VoiceChatbot_ver1.py의 requirement
- streamlit==1.34.0
- sounddevice==0.4.6
- numpy==1.26.2
- pydub==0.25.1
- SpeechRecognition==3.10.4
- google-cloud-speech==2.26.0
- google-cloud-texttospeech==2.16.3
- openai==1.30.1
- python-dotenv==1.0.1


### 감정분석모델
- https://github.com/SKTBrain/KoBERT에서 불러온 모델이므로, 코드 실행 시 각 라이브러리 버전 확인 필요
- 사용 데이터: 감성 대화 말뭉치(https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=86) & 감정 분류를 위한 대화 음성 데이터(https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&dataSetSn=263)
- import gluonnlp as nlp 오류 발생 시, numpy 버전 낮춰주기
- Test에서 사용한 함수는 일기를 입력했을 때, '중립'을 제외한 나머지 6가지 감정 중 높은 비율을 가진 상위 3개의 감정만 출력되도록 함.
- 
##############수정################

<br><br>
### UX/UI
✔️ 로그인, 회원가입

![image](https://github.com/user-attachments/assets/bea6f822-968b-41b3-aee7-f0e1f0a0c168)
<br><br>

✔️ 주요 화면

![Component 2](https://github.com/user-attachments/assets/258c6947-25c0-4041-aa3a-5ca29b9b48e6)
<br><br>

✔️ User Flow

![user flow (1)](https://github.com/user-attachments/assets/bedd1c74-3b32-42ac-8313-cb3225d9ec9f)
<br><br>
