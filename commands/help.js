const { Message } = require("discord.js");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h' , 'info'],
    permissions: [],
    description: "Displays all the commands",
    execute(message, args, Discord) {

        const newEmbed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle('Toast Coin Commands')
        .setDescription('This is a list of all the commands I am capable of:')
        .addFields(
            {name: '$balance or $bal or $bl', value: 'Checks your $TC balances'},
            {name: '$daily', value: 'Receive a random amount (1-5) of $TC everyday'},
            {name: '$donate @[user] [amount]', value: 'Gives the entered [amount] of $TC to the entered [user]'},
            {name: '$leaderboard or $lb', value: 'Displays the top 10 users with the highest amount of $TC'},
            {name: '$bet help', value: 'Learn all about how the betting system works'},
        )
    
        message.channel.send({embeds: [newEmbed]});
    
    }
    
}