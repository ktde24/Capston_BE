const asyncHandler=require("express-async-handler");
const {ElderlyUser}=require('../models/ElderlyUser');

//ElderlyUser 전체 조회
const getAllElderlyUsers=asyncHandler(async(req,res)=>{
  const result=await ElderlyUser.find();
  res.send(result);
});

//ElderlyUser 가입
const addElderlyUser=asyncHandler(async(req,res)=>{
  const user=await ElderlyUser.create({
    name:req.body.name, 
    password:req.body.password, 
    birthday:req.body.birthday, 
    existingConditions:req.body.existingConditions, 
    phone:req.body.phone,
    guardianId:req.body.guardianId,
  });

  console.log('회원가입 완료');
});

module.exports={getAllElderlyUsers,addElderlyUser,
  //updateElderlyUserinfo,//deleteElderlyUser
  }; 