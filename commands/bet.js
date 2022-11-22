const profileModel = require("../models/profileSchema");
const {MessageEmbed, MessageCollector} = require('discord.js');
const betSetGet = require("../betSetGet");
require('dotenv').config();

module.exports = {
    name: "bet",
    aliases: [],
    permissions: [],
    description: "All things bets",
    async execute(message, args, cmd, client, discord, profileData) {



        try {
            const embed = new MessageEmbed()
            .setColor("BLUE")
            .setFooter("$bet [amount] [option]\nex: $bet 20 Toast");

            if(!args.length) return message.reply(`No betting command was entered`);

            let response = args[0]

            if(isNaN(response) == true) {
                response = response.toLowerCase()
            }

            if(response == "custom" && message.member.roles.cache.has(process.env.MOD_ROLE)) {
                if(betSetGet.betInProgress == true) {
                    message.reply("A bet is already in progress")
                    return
                }

                embed.setTitle("Who will win?")

                const filter = (m) => m.author.id === message.author.id;

                message.channel.send("Options for bet?");

                let desc = ""

                message.channel
                    .awaitMessages({ filter, max: 1, time: 30000, errors: ['time']})
                    .then((collected) => {
                        const msg = collected.first();
                        betSetGet.msgArr = msg.content.split(",").map(item => item.trim());

                        if(betSetGet.msgArr.length < 2) {
                            return message.reply("Need more than 1 option, try again")
                        }

                        for(let i = 0; i < betSetGet.msgArr.length; i++){
                            if(/\s/.test(betSetGet.msgArr[i])){
                                return message.reply("No spaces allowed in options, try using underscores")
                            }

                            let str = betSetGet.msgArr[i].toLowerCase();
                            let str2 = str.charAt(0).toUpperCase() + str.slice(1);
                            desc += `Option ${i + 1}: **${str2}**\n`
                        }

                        //if any options contain spaces, give error message

                        embed.setDescription(desc)
                        message.channel.send({embeds: [embed]});
                        betSetGet.betInProgress = true;
                        betSetGet.acceptingBets = true;
                    })
                    .catch((err) => console.log(err));
                
            } else if(response == "classic" && message.member.roles.cache.has(process.env.MOD_ROLE)) {
                if(betSetGet.betInProgress == true) {
                    message.reply("A bet is already in progress")
                    return
                }
                
                embed.setTitle("Who will win?")
                embed.setDescription("Option 1: **Mer**\nOption 2: **Chris**")
                message.channel.send({embeds: [embed]});
                betSetGet.betInProgress = true;
                betSetGet.acceptingBets = true;

                betSetGet.msgArr[0] = "Mer";
                betSetGet.msgArr[1] = "Chris";
        

            } else if(isNaN(response) == false || response == 'all'.toLowerCase()) {

                if(betSetGet.acceptingBets == false) {
                    message.reply("Not accepting bets currently")
                    return
                }

                let betAmount = response;

                if(betAmount == 'all'.toLowerCase()){
                    await profileModel.findOne({ userID: message.author.id });
                    betAmount = profileData.coins;
                }

                //check if the user has enough toast coins to bet
                if(betAmount % 1 != 0 || betAmount <= 0) return message.reply('Bet amount must be a whole number');
                await profileModel.findOne({ userID: message.author.id });
                if(betAmount > profileData.coins) return message.reply(`You don't have that amount of coins to bet`);

                const betOption = args[1];
                let matchFound = false;

                //make sure you selected an option
                for(let i = 0; i < betSetGet.msgArr.length; i++) {
                    if(betOption.toLowerCase() == betSetGet.msgArr[i].toLowerCase()) {
                        matchFound = true;
                    }
                }

                if(matchFound == false) {
                    message.reply("Must bet on one of the options, try again")
                    return
                }


                if(message.member.roles.cache.has(process.env.SUPERSTAR_ROLE)) {
                    const setBet = await profileModel.findOneAndUpdate({
                        userID: message.author.id,
                    }, {
                        $set: {
                            bet: betAmount,
                            betOption: betOption.toLowerCase(),
                            memberBet: true,
                        },
                    }
                    );
                } else {
                    const setBet = await profileModel.findOneAndUpdate({
                        userID: message.author.id,
                    }, {
                        $set: {
                            bet: betAmount,
                            betOption: betOption.toLowerCase(),
                            memberBet: false,
                        },
                    }
                    );
                }
                

            message.reply("Your bet has been set")
            
            } else if(response == "close" && message.member.roles.cache.has(process.env.MOD_ROLE) && betSetGet.betInProgress == true) {
                betSetGet.acceptingBets = false;
                message.channel.send("Betting is now closed");

            } else if(response == "winner" && message.member.roles.cache.has(process.env.MOD_ROLE) && betSetGet.betInProgress == true) {

                if(betSetGet.acceptingBets == true) {
                    message.reply("Make sure to close the bet first, try again")
                    return
                }

                let winner = args[1].toLowerCase();
                let realOption = false;

                for(let i = 0; i < betSetGet.msgArr.length; i++) {
                    if(winner == betSetGet.msgArr[i].toLowerCase()) {
                        realOption = true;
                    }
                }

                if(realOption == false) {
                    message.reply("Winner must be one of the options, try again")
                    return
                }

                const confirmation = await message.channel.send(`Confirm: ${winner} is the winner? (Y or N)`);
                const answers = ['y', 'yes', 'n', 'no'];
                const filter = (m) => answers.includes(m.content.toLowerCase()) && m.author.id === message.author.id;
                let exit = false;

                const collector = confirmation.channel.createMessageCollector(filter, {
                    max: 1,
                    time: 30000,
                });

                collector.on('collect', async (m) => {
                    if (m.content.toLowerCase() === answers[2] || m.content.toLowerCase() === answers[3]) {
                        collector.stop('cancelled');
                        return message.channel.send(`Cancelled - Try again`);
                    }
                    else {        
                        try {
                            betSetGet.betInProgress = false
        
                            let data = await profileModel.find({})
                            let members = []
        
                            //if the member exists push into the members array
                            for (let obj of data) {
                                if(message.guild.members.cache
                                .map((member) => member.id)
                                .includes(obj.userID)) members.push(obj)
                            }
        
                            //check if user has placed a bet
                            members = members.filter(function BigEnough(value) {
                                return value.bet > 0
                            })
        
                            for(i = 0; i < members.length; i++) {
                                let user = await client.users.fetch(members[i].userID)
                                if(!user) return
        
                                let optionLower = members[i].betOption.toLowerCase();
                                let optionCap = optionLower.charAt(0).toUpperCase() + optionLower.slice(1);
        
                                if(members[i].betOption.toLowerCase() == winner.toLowerCase()) {
                                    if(members[i].memberBet == true) {
        
                                        let memberBonus = Math.round(members[i].bet * 1.10);
        
                                        await profileModel.findOneAndUpdate({
                                            userID: members[i].userID
                                        }, {
                                            $inc: {
                                                coins: memberBonus,
                                            },
                                        }
                                        );
        
                                        client.users.fetch(members[i].userID).then((user) => {
                                            user.send(`**${optionCap}** has won the bet! With your Superstar Club bonus you have gained **$${memberBonus} TC** (110% of your bet)!`)
                                            .catch(() => {}); //catch error if the user has closed DMs
                                        });
                                    } else {
                                        await profileModel.findOneAndUpdate({
                                            userID: members[i].userID
                                        }, {
                                            $inc: {
                                                coins: members[i].bet,
                                            },
                                        }
                                        );
                
                                        client.users.fetch(members[i].userID).then((user) => {
                                            user.send(`**${optionCap}** has won the bet! You have gained **$${members[i].bet} TC**!`)
                                            .catch(() => {}); //catch error if the user has closed DMs
                                        });
                                    }
                                    
                                } else {
                                    if(members[i].memberBet == true) {
        
                                        let memberDiscount = Math.round(members[i].bet * .90);
        
                                        await profileModel.findOneAndUpdate({
                                            userID: members[i].userID
                                        }, {
                                            $inc: {
                                                coins: -memberDiscount,
                                            },
                                        }
                                        );
                
                                        client.users.fetch(members[i].userID).then((user) => {
                                            user.send(`**${optionCap}** has lost the bet. With your Superstar Club discount you have lost **$${memberDiscount} TC** (90% of your bet).`)
                                            .catch(() => {}); //catch error if the user has closed DMs
                                        });
        
                                    } else {
                                        await profileModel.findOneAndUpdate({
                                            userID: members[i].userID
                                        }, {
                                            $inc: {
                                                coins: -members[i].bet,
                                            },
                                        }
                                        );
                
                                        client.users.fetch(members[i].userID).then((user) => {
                                            user.send(`**${optionCap}** has lost the bet. You have lost **$${members[i].bet} TC**.`)
                                            .catch(() => {}); //catch error if the user has closed DMs
                                        });
                                    }
                                }
        
                                await profileModel.findOneAndUpdate({
                                    userID: members[i].userID
                                }, {
                                    $set: {
                                        bet: 0,
                                        betOption: "",
                                    },
                                }
                                );
                            }
        
                            let winnerCap = winner.charAt(0).toUpperCase() + winner.slice(1);
                            betSetGet.msgArr = []
                            collector.stop('finished');
                            return message.channel.send(`Bet is finished with the winner being **${winnerCap}**`);
                        } catch {
                            message.channel.send(`Oops, error has occured`);
                        }
                    }
                });
                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                      message.channel.send(
                        `${message.author}, it's been a minute without confirmation. Try again.`
                      );
                    }
                });
            } else if(response == "help") {
                const newEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Toast Coin Betting System')
                .setDescription('These are all the $bet commands:')
                .addFields(
                    {name: '$bet [amount] [option]', value: 'Choose the [amount] of toast coins you want to wager and bet on an [option]'},
                    {name: '$bet all [option]', value: 'Bet all of your toast coins at once'},
                    {name: '$bet classic', value: 'used by mods to start a Chris vs Mer bet'},
                    {name: '$bet custom', value: 'used by mods to start a custom bet'},
                    {name: '$bet close', value: 'used by mods to no longer accept bets'},
                    {name: '$bet winner [option]', value: 'used by mods to select the winner of the bet'},
                );
            
                message.channel.send({embeds: [newEmbed]});
            }
            else{
                return
            }
        } catch (err) {
            console.log(err)
            message.channel.send("Hmmm an error has occured")
        }
    },
}