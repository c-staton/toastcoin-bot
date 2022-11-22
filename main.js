const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"], partials: ["MESSAGE", "CHANNEL", "REACTION"] }); 
const mongoose = require("mongoose");

client.commands = new Discord.Collection();
client.eventNames = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to the database!");
})
.catch((err) => {
    console.log(err);
});

client.login(process.env.DISCORD_TOKEN);
