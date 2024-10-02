const {messaging}=require('../utils/firebaseConfig');
const Alarm = require('../models/alarm');
const schedule = require('node-schedule');
//const ElderlyUser = require('../models/ElderlyUser');
const asyncHandler = require('express-async-handler');

const sendPushNotice= asyncHandler(async (req, res) =>{
  const userId = req.user._id;  // JWT 인증을 통해 userId 추출
  const alarm = await Alarm.findById({ userId });
  //const elderly = await ElderlyUser.findOne({ id });
  
  //사용자가 설정해놓은 시간 db에서 가져오기(elderly table에 속성 추가해야됨)
  //let hour=elderly.pushHour ?? 17;
  //let minute=elderly.pushMin ?? 0;

  if (!alarm) {
    return res.status(404).json({ message: '알림 설정을 찾을 수 없습니다.' });
  }

  let hour = alarm.hour ?? 17;
  let minute = alarm.minute ?? 0;

  const registrationToken = 'Registration token from the client'; // 사용자별로 토큰을 가져와야 함

  try {
    const message = {
      notification: {
        title: '일기를 작성할 시간이에요!',
      },
      android: {
        notification: {
          icon: 'stock_ticker_update',
          color: '#7e55c3',
        }
      },
      tokens: registrationToken,
      topic: '일기 작성 알림',
    };

    // 일정 시간에 푸시 알림을 스케줄링
    let pushNotice = schedule.scheduleJob(`${minute} ${hour} * * *`, function() {
      console.log(`${minute}분 ${hour}시에 알림 전송`);
      messaging().send(message)
        .then((response) => {
          console.log('메시지 알림 전송 성공', response);
        })
        .catch((error) => {
          console.log('메시지 알림 전송 중 에러 발생', error);
        });
    });

    res.status(200).json({ message: '알림 전송이 스케줄링되었습니다.' });

  } catch (error) {
    console.error('푸시 알림 전송 중 에러 발생:', error);
    res.status(500).json({ message: '메시지 알림 전송 중 에러 발생', error });
  }
});

module.exports = { sendPushNotice };
