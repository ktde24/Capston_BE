require("dotenv").config({path: "../.env"}); //.env에 있는 변수 가져오기
const express = require("express");
const expressLayouts=require("express-ejs-layouts");
const session=require("express-session");
const connectDb=require("./config/db");
const app = express();
const port = process.env.PORT || 3000; //.env에 PORT가 없으면 3000번 포트 사용
const cookieParser=require("cookie-parser");//쿠키파서 가져오기
//const methodOverride=require("method-override");

//const {SECRET_KEY}=process.env.SECRET_KEY;

//db 접속
connectDb();

//바디파서(요청 본문을 프로그래밍에 맞게 사용하고 싶을 때) 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//router 등록(노인)
app.use("/",require("./routes/userRoutes"));

app.get("/",(req,res)=>{
  res.send("test");
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log("Running");
});