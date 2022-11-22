const profileModel = require("../models/profileSchema");
const { MessageEmbed, Client } = require('discord.js');

module.exports = {
    name: "leaderboard",
    aliases: ["lb"],
    permissions: [],
    description: "displays leaderboard",
    async execute(message, args, cmd, client, discord, profileData) {
        try{
            let data = await profileModel.find({})

            //make the embed
            const embed = new MessageEmbed()
            .setTitle("**Top 10 users with Toast Coins**")
            .setColor("#00008B")
            .setFooter("You are not ranked yet");

            //fetch members without cache :)
            let members = await profileModel.find().sort({ coins: -1 }).catch(e => console.log(e));

            //check if user has enough money to be on leaderboard
            members = members.filter(function BigEnough(value) {
                return value.coins > 0
            })

            let pos = 0
            for( let obj of members) {
                pos++
                if(obj.userID == profileData.userID) {
                    embed.setFooter(`${message.author.tag.slice(0,-5)}, you're rank #${pos} with $${profileData.coins} TC`)
                }
            }

            //show first 10 people
            members = members.slice(0, 10)
            let desc = ""

            for(let i = 0; i < members.length; i++) {
                let user = await client.users.fetch(members[i].userID)
                if(!user) return
                let bal = members[i].coins
                desc += `**${i + 1}. ${user.tag.slice(0,-5)}:** $${bal} TC\n`
            }

            embed.setDescription(desc)
            message.reply({ embeds: [ embed ]})

        } catch(err){
            console.log(err)
            return message.reply("leaderboard is broken")
        }
    },
}