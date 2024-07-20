const mongoose=require("mongoose");

const ElderlyUserSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  birthday:{ 
    type:Date,
    required:true,
  },
  existingConditions:{
    type:String,
    required:false
  },
  phone:{
    type:String,
    required:true
  },
  guardianId:{
    type:String,
    required: false
  },
  role:{
    type:String,
    default:"elderly"
  }
});

module.exports=mongoose.model("ElderlyUser",ElderlyUserSchema);