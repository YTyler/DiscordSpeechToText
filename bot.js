const Discord = require('discord.js');
const configBot = require('./config.json')
let dispatcher;
// Imports the Google Cloud client library
const googleSpeech = require('@google-cloud/speech')
// Creates a client
const googleSpeechClient = new googleSpeech.SpeechClient();
const { Transform } = require('stream')
let textchannel;

const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 48000,
  languageCode: 'en-US',
};
const request = {
  config: config,
};

//Stream Conversion Functions
//convert a stereo audio input to a mono output
function convertBufferTo1Channel(buffer) {
  const convertedBuffer = Buffer.alloc(buffer.length / 2)

  for (let i = 0; i < convertedBuffer.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    convertedBuffer.writeUInt16LE(uint16, i * 2)
  }

  return convertedBuffer
}

class ConvertTo1ChannelStream extends Transform {
  constructor(source, options) {
    super(options)
  }

  _transform(data, encoding, next) {
    next(null, convertBufferTo1Channel(data))
  }
}


//Main Transcription Function
function thenJoinVoiceChannel(conn) { //should change name of this function for clarity
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
      const recognizeStream = googleSpeechClient
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', response => {
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n')
          textchannel.channel.send(`${user.username} said: "${transcription}"`);
        })

      const convertTo1ChannelStream = new ConvertTo1ChannelStream()

      audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)
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
    textchannel = message;
    const connection = await message.member.voice.channel.join();
    textchannel.channel.send('Scribe has arrived!');
    thenJoinVoiceChannel(connection);
  }
});