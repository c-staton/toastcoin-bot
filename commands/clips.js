const { MessageCollector } = require("discord.js");
require('dotenv').config();
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "clips",
    aliases: ["clip"],
    permissions: [],
    description: "Give points to people who clip",
    async execute(message, args, cmd, client, discord, profileData) {
        message.delete();
        if(!message.member.roles.cache.has(process.env.ADMIN_ROLE)) return message.reply("You are not an admin");
        const clipValue = 20;

        if(!args.length) return message.reply(`You need to mention a player to award them clips`);
        const amount = args[1]
        const target = message.mentions.users.first();
        if(!target) return message.reply("That user does not exist");
        if(amount % 1 != 0 || amount <= 0) return message.reply('Amount of clips must be a whole number');

        //20 tc per clip
        let awardTC = amount * clipValue;

        //give clipper their points
        try{
            await profileModel.findOneAndUpdate({
                userID: target.id
            }, {
                $inc: {
                    coins: awardTC,
                },
            }
            );

            if(amount > 1) {
                return client.channels.cache.get(process.env.CLIPS_CHANNEL).send(`<@${target.id}>, you have been awarded **$${awardTC} TC** for ${amount} clips`)
            } else {
                return client.channels.cache.get(process.env.CLIPS_CHANNEL).send(`<@${target.id}>, you have been awarded **$${awardTC} TC** for ${amount} clip`)
            }

        }catch(err){
            console.log(err)
        }

    },
};