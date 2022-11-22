const profileModel = require("../models/profileSchema");
module.exports = {
    name: "add",
    aliases: [],
    permissions: [],
    description: "add coins to a user's wallet",
    async execute(message, args, cmd, client, discord, profileData) {
        if(!message.member.roles.cache.has(process.env.ADMIN_ROLE)) return message.reply("You are not an admin");
        if(!args.length) return message.reply(`You need to mention a player to give them coins`);
        const amount = args[1]
        const target = message.mentions.users.first();
        if(!target) return message.reply("That user does not exist");

        if(amount % 1 != 0 || amount <= 0) return message.reply('Add amount must be a whole number');

        try{
            const targetData = await profileModel.findOne({ userID: target.id });
            if(!targetData) return message.reply(`This user is not in the **$TC** system`);

            await profileModel.findOneAndUpdate({
                userID: target.id
            }, {
                $inc: {
                    coins: amount,
                },
            }
            );

            return message.reply(`**$${amount} TC** was given to <@${target.id}>`)


        }catch(err){
            console.log(err)
        }
    },
};