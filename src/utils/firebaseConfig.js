require('dotenv').config();

//초기화
var admin = require("firebase-admin");
var serviceAccount=process.env.FIREBASE_ADMIN;
//const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
admin.initializeApp({
  credential:admin.credential.cert(serviceAccount),
});

const messaging=admin.messaging();

module.exports={messaging};