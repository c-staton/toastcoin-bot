const profileModel = require("../models/profileSchema");
module.exports = {
    name: "donate",
    aliases: ["give"],
    permissions: [],
    description: "donates coins to another user",
    async execute(message, args, cmd, client, discord, profileData) {
        if(!args.length) return message.reply(`You need to mention a player to give them coins`);
        const amount = args[1]
        const target = message.mentions.users.first();
        if(!target) return message.reply("That user does not exist");
        if(target.id == message.author.id) return message.reply("You can't donate to yourself");

        if(amount % 1 != 0 || amount <= 0) return message.reply('Donate amount must be a whole number');

        //take coins from donator
        try{
            const targetData = await profileModel.findOne({ userID: target.id });
            if(!targetData) return message.reply(`This user is not in the **$TC** system`);
            if(amount > profileData.coins) return message.reply(`You don't have that amount of coins to donate`);
            await profileModel.findOneAndUpdate({
                userID: message.author.id
            },{
                $inc: {
                    coins: -amount,
                },
            }
            );

        } catch(err){
            console.log(err)
        }


        //give coins to user
        try{
            await profileModel.findOneAndUpdate({
                userID: target.id
            }, {
                $inc: {
                    coins: amount,
                },
            }
            );

            return message.reply(`<@${message.author.id}> has donated **$${amount} TC** to <@${target.id}>`)

        }catch(err){
            console.log(err)
        }
    },
};