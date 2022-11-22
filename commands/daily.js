const profileModel = require("../models/profileSchema");
const ms = require("parse-ms");

module.exports = {
    name: "daily",
    aliases: [],
    permissions: [],    
    description: "Free coins daily",
    async execute(message, args, cmd, client, discord, profileData) {

        try{
            profileData = await profileModel.findOne({ userID: message.author.id });
            if(!profileData){
                let profile = await profileModel.create({
                    userID: message.author.id,
                    serverID: message.guild.id,
                    coins: 10,
                    daily: 0,
                    bet: 0,
                    betOption: "",
                });
            }
        }catch(err){
            console.log(err)
        }


        try {

            //check if user is in the system


            //Check database for last time used
            let timeout = 86400000

            if(timeout - (Date.now() - profileData.daily) > 0) {
                let timeleft = ms(timeout - (Date.now() - profileData.daily))

                //DO TO: Write command for when hour = 1

                if(timeleft.hours < 1) {
                    return message.reply(`You already claimed your daily, try again after:\n${timeleft.minutes} minutes, and ${timeleft.seconds} seconds`)
                } else {
                    return message.reply(`You already claimed your daily, try again after:\n${timeleft.hours} hours, ${timeleft.minutes} minutes, and ${timeleft.seconds} seconds`)
                }
            }

            const randomNumber = Math.floor(Math.random() * 5) + 1;

            const response = await profileModel.findOneAndUpdate({
                userID: message.author.id,
            }, {
                $inc: {
                    coins: randomNumber,
                },
                $set: {
                    daily: Date.now(),
                }
            }
            );
            return message.reply(`${message.author.username}, You have redeemed **$${randomNumber} TC**`);


        } catch (err) {
            console.log(err)
            message.reply("Hmm, an error occured with the daily command")
        }
    },
};