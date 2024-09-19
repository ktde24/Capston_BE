const router = express.Router();
const {sendPushNotice}=require('../controllers/pushController');
//일기 생성 push 알림 보내기
router.get('/push', sendPushNotice);