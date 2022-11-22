const profileModel = require("../models/profileSchema");
const {MessageEmbed, MessageCollector} = require('discord.js');
const queueSetGet = require("../queueSetGet");
require('dotenv').config();

module.exports = {
    name: "queue",
    aliases: ['q'],
    permissions: [],
    description: "All things queue",
    async execute(message, args, cmd, client, discord, profileData) {
        try{
            const embed = new MessageEmbed()
            .setTitle('Two Moons Game Queue')
            .setColor("BLUE")

            if(!args.length){
                if(queueSetGet.queueInProgress === false){
                    message.reply('A queue is not currently in progress');
                    return;
                }

                const user = message.author.tag.slice(0,-5);
                const user_id = message.author.id;

                if(!queueSetGet.queueArr.includes(user)){
                    queueSetGet.queueArr.push(user);
                    queueSetGet.queueIds.push(user_id)
                }

                let desc = '';
                let pos;
                for(let i = 0; i < queueSetGet.queueArr.length; i++){
                    let str = queueSetGet.queueArr[i];

                    if(user === str){
                        pos = i + 1;
                    }

                    desc += `${i + 1}: **${str}**\n`
                }

                embed.setDescription(desc);
                embed.setFooter(`${message.author.tag.slice(0,-5)}, you're #${pos} in the queue`)
                message.reply({embeds: [embed]});
                return;
            } 

            let response = args[0]

            if(isNaN(response) == true) {
                response = response.toLowerCase()
            }

            //ADMIN
            // if(response === "start" && message.member.roles.cache.has(process.env.MOD_ROLE)) {
            if(response === "view") {
                if(queueSetGet.queueInProgress === false){
                    message.reply('A queue is not currently in progress');
                    return;
                }

                let desc = '';
                let pos;
                for(let i = 0; i < queueSetGet.queueArr.length; i++){
                    let str = queueSetGet.queueArr[i];
                    desc += `${i + 1}: **${str}**\n`
                }

                if(queueSetGet.queueArr.length === 0 ){
                    desc = 'The queue is currently empty';
                }

                embed.setDescription(desc);
                embed.setFooter(`Join the queue with $q`)
                message.reply({embeds: [embed]});
                return;
            }
    


            //ADMIN
            // if(response === "start" && message.member.roles.cache.has(process.env.MOD_ROLE)) {
            if(response === "start" && message.member.roles.cache.has(process.env.MOD_ROLE)) {
                if(queueSetGet.queueInProgress === true){
                    message.reply('A queue is already in progress');
                    return;
                }
                embed.setDescription('A new queue has been started.\nJoin with **$q**')
                message.channel.send({embeds: [embed]});
                queueSetGet.queueInProgress = true;
                return
            }

            //ADMIN
            // if(response === 'first') {
            //     if(queueSetGet.queueInProgress === false){
            //         message.reply('A queue is not currently in progress');
            //         return;
            //     }

            //     const user = message.author.tag.slice(0,-5);
            //     const user_id = message.author.id;

            //     if(queueSetGet.queueArr.includes(user)){
            //         const index = queueSetGet.queueArr.indexOf(user);
            //         queueSetGet.queueArr.splice(index,1);
            //         queueSetGet.queueIds.splice(index,1);
            //     }

            //     queueSetGet.queueArr.unshift(user);
            //     queueSetGet.queueIds.unshift(user_id);

            //     let desc = '';
            //     let pos;
            //     for(let i = 0; i < queueSetGet.queueArr.length; i++){
            //         let str = queueSetGet.queueArr[i];

            //         if(user === str){
            //             pos = i + 1;
            //         }

            //         desc += `${i + 1}: **${str}**\n`
            //     }

            //     embed.setDescription(desc);
            //     embed.setFooter(`${message.author.tag.slice(0,-5)}, you're now #${pos} in the queue`)
            //     message.reply({embeds: [embed]});
            //     return;
            // }

            //ADMIN
            if(response === 'code' && message.member.roles.cache.has(process.env.ADMIN_ROLE)){
                if(queueSetGet.queueInProgress === false){
                    message.reply('A queue is not currently in progress');
                    return;
                }

                let code = args[1];
                let range = args[2];

                for(let i = 0; i < range; i++){
                    let user = await client.users.fetch(queueSetGet.queueIds[i])
                    if(!user) return

                    client.users.fetch(queueSetGet.queueIds[i]).then((user) => {
                        user.send(`The Two Moons game code is: ${code}`)
                        .catch(() => {}); //catch error if the user has closed DMs
                    });
                }

                queueSetGet.queueArr.splice(0, range);
                queueSetGet.queueIds.splice(0, range);
                message.reply(`Code sent out to the ${range} top users`);
                
                //display refreshed queue
                let desc = '';
                let pos;
                for(let i = 0; i < queueSetGet.queueArr.length; i++){
                    let str = queueSetGet.queueArr[i];

                    if(user === str){
                        pos = i + 1;
                    }

                    desc += `${i + 1}: **${str}**\n`
                }

                embed.setDescription(desc);
                message.reply({embeds: [embed]});
                return;
            }

            //ADMIN
            if(response === 'remove'){
                if(message.member.roles.cache.has(process.env.MOD_ROLE) && args[1]){
                    if(queueSetGet.queueInProgress === false){
                        message.reply('A queue is not currently in progress');
                        return;
                    }

                    let spot = args[1];

                    if(spot > queueSetGet.queueArr.length){
                        return
                    }

                    queueSetGet.queueArr.splice(spot - 1, 1);
                    queueSetGet.queueIds.splice(spot - 1, 1);
                    message.reply(`#${spot} has been removed from the queue`);
                    return;
                } 
                
                else{
                    if(queueSetGet.queueInProgress === false){
                        message.reply('A queue is not currently in progress');
                        return;
                    }
    
                    const user = message.author.username;
                    const user_id = message.author.id;
    
                    if(!queueSetGet.queueArr.includes(user)){
                        message.reply('You are not in the queue');
                        return;
                    }
    
                    const index = queueSetGet.queueArr.indexOf(user);
                    queueSetGet.queueArr.splice(index,1);
                    queueSetGet.queueIds.splice(index,1);
                    message.reply('You have removed yourself from the queue')
                    return;
                }
            }

            //ADMIN
            if(response === 'end' && message.member.roles.cache.has(process.env.MOD_ROLE)) {
                if(queueSetGet.queueInProgress === false){
                    message.reply('A queue is not currently in progress');
                    return;
                }

                queueSetGet.queueArr.length = 0;
                queueSetGet.queueIds.length = 0;
                queueSetGet.queueInProgress = false;
                message.reply('queue ended');
                return;
            }

            if(response === 'help') {
                const newEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Two Moons Queue Commands')
                .setDescription('These are all the $queue commands:')
                .addFields(
                    {name: '$q', value: 'Join and view the current queue'},
                    {name: '$q remove', value: 'Remove yourself from the queue'},
                    {name: '$q view', value: 'View the queue without joining'}

                );
            
                message.channel.send({embeds: [newEmbed]});
            }


        } catch (err) {
            console.log(err)
            message.channel.send("Hmmm an error has occured")
        }
    },
}