const Discord = require('discord.js');
const DiscordOpus = require('@discordjs/opus');
const auth = './auth'

// Initialize Discord Bot
const bot = new Discord.Client();

bot.once('ready', () => {
    console.log('You did it!');
}); 

async () => {
    console.log('calling')
    const login = await bot.login(auth.botToken);
};