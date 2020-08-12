const Discord = require('discord.js');
const DiscordOpus = require('@discordjs/opus');
const configBot = require('./config.json')
const fs = require('fs');
let dispatcher;
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
// Creates a client
const client = new speech.SpeechClient();
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
let filename = 'test.pcm';
const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
};

const audio = {
  content: fs.readFileSync(filename).toString('base64'),
};

const request = {
  config: config,
  audio: audio,
};

// make a new stream for each time someone starts to talk
function generateOutputFile(channel, member) {
    const fileName = `${member.username}-${Date.now()}.pcm`;
    console.log(fileName);
    return fs.createWriteStream(fileName);
}

function thenJoinVoiceChannel(conn) {
    //console.log(`Scribe: ready: ${conn.channel.name}!`);

    // create our voice receiver
    const receiver = conn.receiver;

    // Must play a sound over the channel otherwise incoming voice data is empty
    console.log('Scribe: Play join.mp3...');
    dispatcher = conn.play('join.mp3', { passes: 5 });
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

    conn.on('speaking', (user, speaking) => {
        console.log('Scribe: Current Members: ', conn.channel.members.size);
        console.log('Scribe: speaking: ', speaking);

        if (speaking.has('SPEAKING')) {
            //msg.channel.sendMessage(`I'm listening to ${user}`);
            console.log(`Scribe: listening to ${user.username}`);
            // console.log(`Scribe: CONN ${conn}`, conn);
            console.log(`Scribe: SPEAKING`, speaking);
            // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
            const audioStream = receiver.createStream(user, { mode: 'pcm' });
            //const audioStream = receiver.createStream(user, { mode: 'opus' });
            // create an output stream so we can dump our data in a file
            const outputStream = generateOutputFile(conn.channel, user);
            // pipe our audio data into the file stream
            //audioStream.on('data', (chunk) => {
            //    console.log(`Scribe: Received ${chunk.length} bytes of data.`);
            //});
            filename = outputStream;
            audioStream.pipe(outputStream);
            outputStream.on("data", console.log);
            // when the stream ends (the user stopped talking) tell the user
            audioStream.on('end', () => {
                //msg.channel.sendMessage(`I'm no longer listening to ${user}`);
                console.log(`Scribe: stop listening to ${user.username}`);
            });
        }
    });
}


// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(configBot.botToken);
bot.once('ready', () => {
    console.log("Ready for Disco \n♪♪\\('O')/♪♪");
});
//Test Bot Works
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
//Bot Joins Voice Channel of User upon any message
bot.on('message', async message => {
	// Join the same voice channel of the author of the message
	if (message.member.voice.channel) {
    if (message.content === 'Join') {
		const connection = await message.member.voice.channel.join();
    thenJoinVoiceChannel(connection);
  }
	}
  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log('Transcription: ', transcription);
});
