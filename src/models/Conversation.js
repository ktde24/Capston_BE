const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: Number,
    unique: true,
    autoIncrement: true
  },
  userId: { // 확인 필요
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ElderlyUser',
    required: true
  },
  role: {
    type: String,
    enum:['Sodam','User'],
    required:true,
  },
  message:{
    type:Text,
    required:true,
  },
  timestamp:{
    type:Date,
    default:Date.now,
  },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
