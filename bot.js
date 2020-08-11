const Discord = require('discord.js');
const DiscordOpus = require('@discordjs/opus');
const config = require('./config.json')

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(config.botToken);
bot.once('ready', () => {
    console.log("Ready for Disco \n♪♪\\('O')/♪♪");
}); 

bot.on('message', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong');
    }
});