const profileModel = require("../models/profileSchema");
module.exports = {
    name: "balance",
    aliases: ["bal", "bl", "coins"],
    permissions: [],
    description: "Check the user balance",
    async execute(message, args, cmd, client, discord, profileData) {
        try {
        if(typeof args[0] == "undefined") {
            message.reply(`You have **$${profileData.coins} TC**`);
        } else {
            try {

                if(!args.length) return message.reply(`You need to mention a player to give them coins`);
                const target = message.mentions.users.first();
                if(!target) return message.reply("That user does not exist");
                if(target.id == message.author.id) return message.reply("Just use $bal to check your own balance");

                const targetData = await profileModel.findOne({ userID: target.id });
                if(!targetData) return message.reply(`This user is not in the **$TC** system`);

                message.reply(`**${target.tag.slice(0,-5)}** has $${targetData.coins} TC`);
                
            } catch (err) {
                console.log(err)
                message.reply("Hmmm, an error has occured");
            }
        }
    } catch (err) {
        console.log(err)
        message.reply("Try again")
    }

    },
};
