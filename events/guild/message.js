require('dotenv').config();
const { ReactionCollector } = require('discord.js');
const profileModel = require("../../models/profileSchema");

const cooldowns = new Map();

module.exports = async (Discord, client, message) => {

    if(message.author.bot) return;

    let profileData;
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
                memberBet: false,
              });
        }
    }catch(err){
        console.log(err)
    }

    //each message has 1/100 chance of earning 1tc
    let randomNumber = Math.floor(Math.random() * 100) + 1;
    let randomResponse = Math.floor(Math.random() * 5) + 1;

    if(randomNumber == 1) {
        await profileModel.findOneAndUpdate({
            userID: message.author.id,
        }, {
            $inc: {
                coins: 1,
            }
        }
        );
        if(randomResponse == 1) {
            message.reply(`${message.author.username} has stumbled apon a free toast coin!`);
        } else if(randomResponse == 2) {
            message.reply(`It's ${message.author.username}'s lucky day today, have a free toast coin!`);
        } else if(randomResponse == 3) {
            message.reply(`Holy cow! That's a free toast coin! Here ${message.author.username}, take this!`);
        } else if(randomResponse == 4) {
            message.reply(`Bark! $1 TC has been added to ${message.author.username}'s balance`);
        } else if(randomResponse == 5) {
            message.reply(`Cha-ching! ${message.author.username} is $1 TC richer!`);
        }
    }

    //yt clips
    if (message.channel.id === process.env.CLIPS_CHANNEL) {
        if(message.content.startsWith("https://youtube.com/clip/")) {
            try {
                await message.react('✅');
              } catch(err) {
                console.error(err);
              }
        }

        const filter = (reaction, user) => {
            return reaction.emoji.name === '✅' && (user.id === process.env.CHRIS_ID || user.id === process.env.MER_ID);
        };
        
        const collector = message.createReactionCollector({ filter });
        
        collector.on('collect', async (reaction, user) => {
            try{
                await profileModel.findOneAndUpdate({
                    userID: message.author.id
                }, {
                    $inc: {
                        coins: 20,
                    },
                }
                );
    
                return client.channels.cache.get(process.env.CLIPS_CHANNEL).send(`<@${message.author.id}>, you have been awarded **$20 TC**. Thanks for clipping!`)
            } catch(err){
                console.log(err)
            }
        });
    }





    //limit to certain channels
    if(message.channel.id != process.env.CLIPS_CHANNEL && 
        message.channel.id != process.env.TC_CHANNEL &&
        message.channel.id != process.env.SUPERSTAR_CHANNEL &&
        message.channel.id != process.env.COMMANDS_CHANNEL &&
        message.channel.id != process.env.TESTING_CHANNEL &&
        message.channel.id != process.env.QUEUE_CHANNEL &&
        message.channel.id != process.env.TEST_SERVER) return; 

    const prefix = process.env.PREFIX;
    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if (!command) return //if entered command does not exist then do nothing

    const validPermissions = [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS",
    ]

    if(command.permissions.length){
        let invalidPerms = []
        for(const perm of command.permissions){
            if(!validPermissions.includes(perm)){
                return console.log(`Invalid Permissions ${perm}`);
            }
            if(!message.member.permissions.has(perm)) {
                invalidPerms.push(perm);
                break;
            }
        }
    }


    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    var current_time = Date.now();
    const time_stamps = cooldowns.get(command.name);
    const cooldown_amount = (command.cooldown) * 1000;

    if(time_stamps.has(message.author.id)){
        const expiration_time = time_stamps.get(message.author.id) + cooldown_amount; 

        current_time = profileModel.dailyCooldown;


        if(current_time < expiration_time){
            const time_left = (expiration_time - current_time) / 1000;

            if(time_left > 3600){
                const hours = Math.floor(time_left / 3600);
                const minutes = Math.floor((time_left - (hours * 3600)) / 60);

                if(hours > 1 && minutes > 1){
                    return message.reply(`You need to wait ` + hours + ` hours and ` + minutes + ` minutes before using $${command.name}`);
                } else if(hours == 1 && minutes > 1){
                    return message.reply(`You need to wait ` + hours + ` hour and ` + minutes + ` minutes before using $${command.name}`);
                } else if(hours > 1 && minutes == 1){
                    return message.reply(`You need to wait ` + hours + ` hours and ` + minutes + ` minute before using $${command.name}`);
                } else if(hours == 1 && minutes == 1){
                    return message.reply(`You need to wait ` + hours + ` hour and ` + minutes + ` minute before using $${command.name}`);
                } else {
                    return message.reply(`You need to wait ` + hours + ` hour before using $${command.name}`);
                }
            } else {
                const minutes = Math.floor(time_left / 60);
                if(minutes > 1){
                    return message.reply(`You need to wait ` + minutes + ` minutes before using $${command.name}`);
                } else {
                    return message.reply(`You need to wait ` + minutes + ` minute before using $${command.name}`);
                }
            }
        }
    }

    time_stamps.set(message.author.id, current_time);
    setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);

    try{
        command.execute(message, args, cmd, client, Discord, profileData);
    } catch (err){
        message.reply("There was an error trying to execute this command!");
        console.log(err);
    }
}