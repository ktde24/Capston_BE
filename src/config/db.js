const mongoose=require("mongoose");
const asyncHandler=require("express-async-handler");
require("dotenv").config();

//커넥션 스트링 이용해 db 접근
const connectDb=asyncHandler(async()=>{
  const connect=await mongoose.connect(process.env.MONGODB_URI);
  console.log(`DB Connected: ${connect.connection.host}`);
});

module.exports=connectDb;