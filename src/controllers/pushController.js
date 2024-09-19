const {messaging}=require('../utils/firebaseConfig');
const schedule = require('node-schedule');
const ElderlyUser = require('../models/ElderlyUser');
const asyncHandler = require('express-async-handler');

const sendPushNotice= asyncHandler(async (req, res) =>{
  const { id } = req.params;
  const elderly = await ElderlyUser.findOne({ id });
  
  //사용자가 설정해놓은 시간 db에서 가져오기(elderly table에 속성 추가해야됨)
  //let hour=elderly.pushHour ?? 17;
  //let minute=elderly.pushMin ?? 0;

  let hour=17;
  let minute=0;

  const registrationToken='Registration token from the client';

  try {
    const message={
      notification: {
        title: '일기를 작성할 시간이에요!',
      },
      android: { //android 기기에 전송
        notification: {
          icon: 'stock_ticker_update',
          color: '#7e55c3',
          //clickAction:'news_intent' : 이 알림 누르면 news_intent 실행
        }
      },
      /*webpush: {//눌렀을 때 웹페이지와 연결
        fcmOptions: {
          link: 'breakingnews.html'
        }
      },*/
      tokens: registrationToken,
      topic: '일기 작성 알림',
    };
    
    let pushNotice=schedule.scheduleJob(`${minute} ${hour} * * *`,function(){
      console.log(`${minute}시 ${hour}에 실행`);
      messaging().send(message).then((response)=>{
        //response: msg ID string
        console.log('메시지 알림 성공',response);
      })
      .catch((error)=>{
        console.log('메시지 알림 전송 중 에러 발생',error);
      });  
    });

  } catch (error) {
    res.status(500).json({ message: '메시지 알림 전송 중 에러 발생' });
  }
});

module.exports={sendPushNotice};

