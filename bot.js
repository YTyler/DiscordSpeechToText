const Discord = require('discord.js');
const configBot = require('./config.json')
let dispatcher = null;
let textchannel = null;

const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 48000,
  languageCode: 'en-US',
};
const request = {
  config: config,
};


//Main Transcription Function
function connectTranscribe(conn) { //should change name of this function for clarity
  // create our voice receiver
  const receiver = conn.receiver;

  // Must play a sound over the channel first otherwise incoming voice data is empty
  console.log('Scribe: Play join.mp3...');
  dispatcher = conn.play('join.mp3', { passes: 5 });
  
  //log status of dispatcher connection attempts
  dispatcher.on('start', () => {
    console.log('Scribe: Play Starting...');
  });
  dispatcher.on('finish', () => {
    console.log('Scribe: Finished playing!');
  });
  dispatcher.on("end", end => {
    console.log('Scribe: End Finished playing!');
  });
  conn.on('error', (error) => {
    console.log("conn Error!", error);
  });
  conn.on('failed', (error) => {
    console.log("conn Fail!", error);
  });

  //Transcription
  conn.on('speaking', (user, speaking) => {
    if (speaking.has('SPEAKING')) {
      const audioStream = receiver.createStream(user, { mode: 'pcm' });
      textchannel.send('speech detected');
    }
  });
}

// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(configBot.botToken);
bot.once('ready', () => {
  console.log("Ready for Disco \n\n♪♪ \\('O')/ ♪♪");
});

//Bot Joins Voice Channel of User upon 'Join'  message
bot.on('message', async message => {
  // Join the same voice channel of the author of the message
  if (message.member.voice.channel && message.content === 'Join') {
    textchannel = message.channel;
    const connection = await message.member.voice.channel.join();
    textchannel.send('Scribe has arrived!');
    textchannel.send(texchannel);
    connectTranscribe(connection);
  }
});