const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  serverID: { type: String, require: true },
  coins: { type: Number, default: 10 },
  bank: { type: Number },
  daily: {type: Number, default: 0},
  bet: { type: Number, default: 0 },
  betOption: { type: String, default: "" },
  memberBet: { type: Boolean, default: false},
});

const model = mongoose.model("ProfileModels", profileSchema);

module.exports = model;