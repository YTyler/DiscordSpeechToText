const Discord = require('discord.js');
const DiscordOpus = require('@discordjs/opus');
const {prefix, botToken} = require('./config.json')

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(botToken);
bot.once('ready', () => {
    console.log("Ready for Disco \n♪♪ \\('O')/ ♪♪");
}); 

//Bot Commands
bot.on('message', message => {
    if (message.content.startsWith(`${prefix}ping`)) {
        message.channel.send('pong');
    } else if (message.content.startsWith(`${prefix}beep`)) {
        message.channel.send('boop');
    }
    else if (message.content.startsWith(`${prefix}server`)) {
        message.channel.send(
            `Server Details
            Name: ${message.guild.name}
            Description: ${message.guild.description ? message.guild.description : 'No Description' }
            Total Members: ${message.guild.memberCount}
            Date Created: ${message.guild.createdAt}
            Region: ${message.guild.region}`
        );
    }
});