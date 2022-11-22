const profileModel = require("../../models/profileSchema");

module.exports = async (client, discord, member) => {
  let profile = await profileModel.create({
    userID: member.id,
    serverID: member.guild.id,
    coins: 10,
    daily: 0,
    bet: 0,
    betOption: "",
    memberBet: false,
  });
  profile.save();
};

//NOT WORKING