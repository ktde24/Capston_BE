const mongoose = require('mongoose');

const GuardianUserSchema = new mongoose.Schema({
  guardianId: {
    type: Number,
    unique: true,
    autoIncrement: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  birth: { 
    type: Date,
    required: true,
  },
  job: { 
    type: String,
    required: true,
  },
  existingConditions: { 
    type: String,
    required: true,
  },
  elderlyName: {
    type: String,
    required: true,
  },
  elderlyPhone: { 
    type: String,
    required: true,
  },
  elderlyAddress: {
    type: String,
    required: true
  },
  elderlyBirthday: { 
    type: Date,
    required: true,
  },
  role: {
    type: String,
    default: "guardian"
  }
});

const GuardianUser = mongoose.model('GuardianUser', GuardianUserSchema);
module.exports = GuardianUser;