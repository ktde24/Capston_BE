// 0726 ver
const express = require('express');
const { startSTT, upload } = require('../controllers/sttController');

const router = express.Router();

router.post('/start', upload.single('audio'), startSTT);

module.exports = router;
