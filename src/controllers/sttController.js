// 0726 ver
const multer = require('multer');
const fs = require('fs');
const { speechToText } = require('../utils/stt');

const upload = multer({ dest: 'uploads/' });

const startSTT = async (req, res) => {
  const audioFile = req.file;
  try {
    const text = await speechToText(audioFile.path);
    fs.unlinkSync(audioFile.path); // 업로드된 파일 삭제
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ message: 'STT 변환 실패', error: error.message });
  }
};

module.exports = { startSTT, upload };
