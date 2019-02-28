"use strict";
console.log("JS log: Beginning script execution.");
console.info("JS log: Logging will be taken over by Winston.");

//Always set up logging before anything else.
var logger = require("winston");
logger.info("Winston loaded.");
var fs = require('fs');
logger.info("fs loaded.");
var exec = require("sync-exec");
logger.info("Sync-exec loaded.");
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.add(logger.transports.File, {
    filename: "happenings.log"
});
console.log("JS log: Winston has been set up. Standard console output will no longer be used.");
logger.level = 'debug';
logger.info("Normal execution beginning on " + getDateTime());
logger.verbose("Logs are being written out to ./happenings.log");

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec + " on " + month + "/" + day + "/" + year;
}

const os = require('os');
logger.debug("OS loaded.");

var waitUntil = require('wait-until');

const commandLineArgs = require('command-line-args')
const optionDefinitions = [{
    name: 'config',
    type: String,
    multiple: false,
    defaultOption: true
}];
const cliOptions = commandLineArgs(optionDefinitions, {
    partial: true
});
var configFile;
if (cliOptions.config == undefined) {
    configFile = "config.ini";
    logger.warn("No configuration file specified. Defaulting to config.ini");
} else {
    configFile = cliOptions.config;
}

var ini = require('ini');
logger.debug("ini loaded.");
var config;
try {
    config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
    logger.verbose("" + configFile + " parsed.");
} catch (e) {
    throw "Configuration file (" + configFile + ") not found. This file is required for the bot to do anything. Refusing to continue execution.";
}

var prefix = config.controls.prefix
var token = config.account.token;
var bot_game = config.account.game;
var owner = config.account.owner;
var your_account = config.account.your_account;
var bot_name = config.account.bot_name;
var channels = config.account.general;
var voiceID = config.account.default_voice;
var whitelist = config.channels.allowed_channels
var songarray = [];
var voiceLock = false;
var lastYT;
var audioDone = false;
var alreadyFired = false;
var audioErrors = 0;
var maxerrors = Number(config.controls.maxerrors);
logger.info("Applying logging level from config. I'll either shut up now or keep yakking.")
logger.level = config.controls.loglevel


//Enable or disable features
var snail_race = config.controls.snail;
var audio_player = config.controls.voice;
var yt_player = config.controls.youtube;
var qodapi = config.controls.quote;
var ttsquote = config.controls.tts;
var googlesearch = config.controls.googlesearch;

//Now of all, we need to load the dependencies we downloaded!
var droid = require("discord.io");
logger.debug("Discord.io loaded.");
var xkcd = require('xkcd-api');
logger.debug("xkcd-api loaded.");
var sys = require('sys');
logger.debug("sys loaded");
const fetch = require('node-fetch');
logger.debug("Node-fetch loaded");
var Worker = require("tiny-worker");
logger.debug("tiny-worker loaded")

//Set up asm.js stuff
var heap = new ArrayBuffer(0x10000)
var stdlib = {
    Math: Math,
    Float64Array: Float64Array,
    Float32Array: Float32Array
}
function buildBuffer(length) {
    var result = new Float64Array(length);
    for (var i = 0; i < length; i++) {
      result[i] = i + 1;
    }
    return result;
}

//Pythagorean calculator
function PythModule(stdlib, foreign, heap) {
    "use asm"
    var sqrt = stdlib.Math.sqrt
    var output = 0.0
    var a = 0.0
    var b = 0.0
    var c = 0.0
    function computeHyp(x, y) {
        x = +x
        y = +y
        a = +(x*x)
        b = +(y*y)
        c = +(a + b)
        output = +sqrt(c)
        return +output
    }
    function computeLeg(x, y) {
        x = +x
        y = +y
        a = +(x*x)
        b = +(y*y)
        c = +(b - a)
        output = +sqrt(c)
        return + output
    }
    return { computeHyp: computeHyp,
        computeLeg: computeLeg }
}
var pythagoras = new PythModule(stdlib, null, heap);
logger.verbose("Successfully compiled PythModule")

//Geomtric mean
function GeomModule(stdlib, foreign, heap) {
    "use asm";
    var exp = stdlib.Math.exp;
    var log = stdlib.Math.log;
    var values = new stdlib.Float64Array(heap);
    function logSum(start, end) {
        start = start | 0;
        end = end | 0;
        var sum = 0.0,
            p = 0,
            q = 0;
        // asm.js forces byte addressing of the heap by requiring shifting by 3
        for (p = start << 3, q = end << 3;
            (p | 0) < (q | 0); p = (p + 8) | 0) {
            sum = sum + +log(values[p >> 3]);
        }
        return +sum;
    }
    function geometricMean(start, end) {
        start = start | 0;
        end = end | 0;
        return +exp(+logSum(start, end) / +((end - start) | 0));
    }
    return { geometricMean: geometricMean };
}
var geometricMean = GeomModule(stdlib, null, buildBuffer(0x100000)).geometricMean
logger.verbose("Successfully compiled geometricMean from module")

//Find trig ratios
function TrigModule(stdlib, foreign, heap) {
    "use asm"
    var sin = stdlib.Math.sin
    var cos = stdlib.Math.cos
    var tan = stdlib.Math.tan
    foreign = +foreign
    var pi = 0.0
    pi = +foreign
    function toRadians(angle) {
        angle = +angle
        var theta = 0.0
        var radian = 0.0
        radian = +(+pi / 180.0)
        theta = +(+angle * +radian)
        return +theta
    }
    function trigSine(angle) {
        var theta = 0.0
        theta = +toRadians(+angle)
        return +sin(+theta)
    }
    function trigCosine(angle) {
        var theta = 0.0
        theta = +toRadians(+angle)
        return +cos(+theta)
    }
    function trigTangent(angle) {
        var theta = 0.0
        theta = +toRadians(+angle)
        return +tan(+theta)
    }
    return {
        trigSine: trigSine,
        trigCosine: trigCosine,
        trigTangent: trigTangent
    }
}
var trigRatios = TrigModule(stdlib, +Math.PI, buildBuffer(0x200000))
function calcTrig(angle) {
    angle = +angle
    var output;
    output = "Sine: " + String(trigRatios.trigSine(angle));
    output = output + "\nCosine: " + String(trigRatios.trigCosine(angle));
    output = output + "\nTangent: " + String(trigRatios.trigTangent(angle));
    return output
}
logger.verbose("Successfully compiled TrigModule")

//Roll a die
var DieRoller = function(stdlib, foreign, heap) {
    "use asm";
    var floor = stdlib.Math.floor
    var random = stdlib.Math.random
    function dieExport(faces) {
        faces = +faces
        var randomNumber = 0;
        randomNumber = (floor(+random() * +faces)|0 + 1|0)|0
        return randomNumber|0;
    }
    return {dieExport: dieExport}
}
var dieExport = DieRoller(stdlib, null, heap).dieExport
function rollDie(sides) {
    var faces = 6
    if (sides) {
        faces = sides
    }
    return dieExport(faces)
}
logger.verbose("Successfully compiled the die roller")

//Load YouTube audio functionaility if requested
var youtube;
var stream;
var search;
var opts;
if (yt_player == "yes") {
    youtube = require("youtube-mp3-downloader");
    stream = new youtube({
        "ffmpegPath": config.audio.ffmpeg, // Where is the FFmpeg binary located?
        "outputPath": "./", // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "lowest", // What video quality should be used?
        "queueParallelism": 2, // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000 // How long should be the interval of the progress reports
    });
    logger.debug("YouTube MP3 Downloader loaded.");
    search = require('youtube-search');
    opts = {
        maxResults: 1,
        key: config.audio.youtube_key
    };
    logger.debug("youtube-search loaded.");
}

//Prepare Google Custom Search if requested
var GoogleSearch;
var googleSearch;
var language;
var results = 1;
if (googlesearch == "yes") {
    GoogleSearch = require('google-search');
    logger.debug("Google CSE API loaded.");
    googleSearch = new GoogleSearch({
        key: config.google.api_key,
        cx: config.google.api_cx
    });
    language = config.google.language;
}

//We need to set some variables for later.
var cow = '```         (__) \n         (oo) \n   /------\\/ \n  / |    ||   \n *  /\\---/\\ \n    ~~   ~~   \n...."Have you mooed today?"...```';
var usage = [
    "Standard commands:\n`quote [tts option]` - Displays funny quote-of-the-day from the Quotes REST API. Add the `tts` option to use Discord's `/tts` feature with it.\n`search <query>` - Display the first Google result for that query in the chat.\n`xkcd [comic # or 'random' ]` - Fetch latest xkcd comic, specify number to show spcified comic, or specify `random` to get random comic.\n",
    "`rick [parameter]` - Instant RickRoll, type `rick` without extra parameter to show available options.\n\nMath stuff (powered by handwritten asm.js):\n`roll [sides]` - Rolls a die. You may optionally specify the number of sides, otherwise it defaults to six.`gmean <value> <value>` - Calculates the geometric mean of the values.\n`hypot <leg> <leg>` - Calculates the hypotenuse of a right triangle from the given legs.\n`leg <known leg> <hypotenuse>` - Calulates the missing leg of a rigth triangle from the known sides.", 
    "`trig <decimal angle in degrees>` - Calculates the sine, cosine, and tangent of the given angle.\n\nStupid stuff:\n",
    "`open the pod bay doors` - Try it.\n`moo` - Moos.\n`borg` - Holdover from the old days.\n\nVoice commands:\n`next` - Jumps to next entry on playlist.\n`switch_voice <selector>` - Change selected voice channel.\n`list_voice` - Lists configured voice channels.\n`set_voice <channel_id>` - Manually set voice channel ID.\n`stream <YouTube video ID>` - Streams the audio of the video matching the provided ID.\n`yt <keywords>` - Streams the audio of the first video result matching the specified keywords.\n`playlist` - Lists queued audio files.\n`leave` - Clears the playlist and stops streaming all audio.\n\nScript commands:",
    "`reconfig` - Reload values from configuration.\n`reset` - Forces disconnect and reconnect.\n\nTesting commands:\n`debug` - Dumps the last 2000 characters of log file.\n`exception` - For tesing purposes: Throws an exception.\n\nAdmin commands (only work if you are the owner of the bot):\n`shutdown` - Dumps the last part of the log and exits.\n`clear` - Deletes the log file.\n`safemode` - Sets the variable to enter Safe Mode.\n\nDeprecated (no longer functional) commands:\n`videos` - Used to display most recent videos from several meme channels.\n",
    "`audio [selector]` - Previously played a local audio file to currently set voice channel. It was mess to maintain and integrate with the playlist-based YouTube system.\n\n\nFind me on GitHub: https://github.com/geoffreycs/hal9000-bot"
];
var hail = "We are the Borg. Lower your shields and surrender your ships. We will add your biolgical and technological distinctivness to our own. Your culture will adapt to service us. Resistance is futile."
var clogged = "Something clogged up in the tubes. Notify @ " + your_account + "if this issue persists.";
var google_fail = "An error occured. Some causes could be no results found, Google CSE API is down, or there's a bug in the code.\n\nIf this persists, contact Geoffrey at @PosixMaster#9116.\n\n\nDebug info for Geoffrey:\n```";
var startup = true;
var halboot = true;
var limited = "The bot is currently in safe mode. Available functions are limited to:\n`reconfig` - Reload configuration.\n`list_voice` - List configured voice channels.\n`reset` - Disconnects and reconnects socket.\n`debug` - Dumps the latter 2000 characters of the log file.\n`exception` - Invokes exception for testing.\n`shutdown` - Calls `notice()`, dumps last 1000 characters of log file, executes `sync` on POSIX/*nix, and shutsdown NodeJS instance. May only be used by bot owner.\n`force_normal` - Forces script to reenter normal operation. May only be used by bot owner. Do not invoke unless you know what you are doing.\n\nAll other functions are currently disabled.";
var safe_mode = false;

//Stuff for the voice channel functions.
var voices = config.channels.voice_id;
var voice_names = config.channels.voice_name;

var newVoice = voiceID;

//For the !rick command.
var lyrics = "**Never Gonna Give You Up**\n\nWe're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy\n\nI just wanna tell you how I'm feeling\nGotta make you understand\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nWe've known each other for so long\nYour heart's been aching, but\nYou're too shy to say it\nInside, we both know what's been going on\nWe know the game and we're gonna play it\n\nAnd if you ask me how I'm feeling\nDon't tell me you're too blind to see\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\n(Ooh, give you up)\n(Ooh, give you up)\nNever gonna give, never gonna give\n(Give you up)\nNever gonna give, never gonna give\n(Give you up)\n\nWe've known each other for so long\nYour heart's been aching, but\nYou're too shy to say it\nInside, we both know what's been going on\nWe know the game and we're gonna play it\n\nI just wanna tell you how I'm feeling\nGotta make you understand\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you";
var never_gonna_give_you_up = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
var gif = "https://media.giphy.com/media/kFgzrTt798d2w/giphy.gif";
var rick = "Command usage:\n\n`rick <option>`\n\nAvailable options are:\n`roll` - Self explanatory\n`lyrics` - Posts the entire lyrics of the song\n`gif` - Rick roll Giphy image\n\nType `help` for all commands."

function reloadConfig(channelID) {
    try {
        config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
        logger.verbose("" + configFile + " parsed.")
    } catch (e) {
        throw "Configuration file (" + configFile + ") not found. This file is required for the bot to do anything. Refusing to continue execution."
    }
    try {
        config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
        token = config.account.token;
        bot_game = config.account.game;
        owner = config.account.owner;
        your_account = config.account.your_account;
        bot_name = config.account.bot_name;
        channels = config.account.general;
        voiceID = config.account.default_voice;
        logger.level = config.controls.loglevel
        voices = config.account.voice_id;
        voice_names = config.account.voice_name;
        audio_player = config.controls.voice;
        snail_race = config.controls.snail;
        yt_player = config.controls.youtube;
        qodapi = config.controls.quote;
        ttsquote = config.controls.tts;
        googlesearch = config.controls.googlesearch;
        whitelist = config.channels.allowed_channels;
        maxerrors = Number(config.controls.maxerrors);
        bot.sendMessage({
            to: channelID,
            message: "Reconfiguration success."
        });
        if (safe_mode == true) {
            normalMode(channelID, true);
        }
    } catch (e) {
        bot.sendMessage({
            to: channelID,
            message: "Error during setting configuration. This script may now be in a very bad, inconsistent, and unpredictable state.\n```" + e + "```"
        })
        safeMode(channelID);
    }

}

function safeMode(channelID) {
    songarray = [songarray[0]]
    bot.sendMessage({
        to: channelID,
        message: prefix + "next"
    });
    safe_mode = true;
    bot.sendMessage({
        to: channelID,
        message: "Safe mode activated. A reduced command set is currently available."
    });
    lastYT = undefined
    lastFileAdded = undefined
}

function normalMode(channelID, success) {
    var output = "Caution: Safe Mode was automatically activated due to a misconfiguration or errors. However, Safe Mode was manually disabled by the owner. Proceed with caution, as the script may be unstable.";
    if (success == true) {
        output = "Safe Mode automatically exited. Normal operation has resumed. Have a nice day!"
    }
    safe_mode = false;
    bot.sendMessage({
        to: channelID,
        message: output
    });
}

function messageGreet() {
    var clock = getDateTime();
    var greet = bot_name + " is now online on " + os.hostname() + " running " + os.platform() + " " + os.release() + " and a(n) " + os.arch() + " " + os.cpus()[0].model + ".\nThe current time here is " + clock + ".";
    return greet;
}

function postGenerals(toSend) {
    for (const value of channels) {
        bot.sendMessage({
            to: value,
            message: toSend
        });
    }
}

function downloadVideo(parameters, channelID) {
    if (lastYT == parameters) {
        bot.sendMessage({
            to: channelID,
            message: "Duplicates are not supported. (The filenames will conflict.) The last request has been cancelled."
        })
    } else {
        lastYT = parameters
        //logger.debug(output)
        stream.download(parameters);
        stream.on("finished", function (err, data) {
            arrayAdd(data.file, channelID);
        });
        stream.on("error", function (error) {
            audioError(error, channelID);
        });
    }
}

function arrayAdd(mp3, textID) {
    if (mp3 == lastFileAdded) {
        logger.debug("Dropping duplicate file addition.")
    } else {
        songarray.push({
            audioFile: mp3,
            channelID: textID
        });
        logger.debug("Adding to buffer file " + mp3)
        lastFileAdded = mp3;
    }

    if (voiceLock == false) {
        songIterate();
    }
}

var lastFileAdded;

function songIterate() {
    bot.leaveVoiceChannel(voiceID, function () {
        if (voiceLock == true) {
            bot.leaveVoiceChannel(voiceID);
            logger.debug("Last file played was " + songarray[0].audioFile);
            channelID = songarray[0].channelID;
            var lengthSongs = songarray.length
            songarray.shift();
            logger.debug("New length of song buffer is now " + lengthSongs);
            try {
                logger.debug("Next file will be " + songarray[0].audioFile)
            } catch (e) {
                logger.debug("Song buffer is empty.")
            }
        } else if (voiceLock == false) {
            bot.sendMessage({
                to: songarray[0].channelID,
                message: "Initializing audio playback."
            });
            voiceLock = true;
            channelID = songarray[0].channelID;
        }
        if (songarray.length > 0) {
            var oldlevel = logger.level
            logger.level = 'error'
            bot.disconnect();
            bot.connect();
            logger.level = oldlevel
            setTimeout(function () {
                playAudio(songarray[0].audioFile, channelID);
                waitUntil()
                    .interval(500)
                    .times(Infinity)
                    .condition(function () {
                        return (audioDone == true ? true : false);
                    })
                    .done(function () {
                        audioDone = false;
                        songIterate();
                    });
            }, 5000)
        } else {
            bot.sendMessage({
                to: channelID,
                message: "End of playlist reached."
            }, function () {
                try {
                    fs.readdirSync('.').forEach(file => {
                        if (file.endsWith(".mp3") == true) {
                            logger.verbose("Cleaning old MP3 file " + file)
                            fs.unlinkSync(file)
                        }
                    });
                    bot.leaveVoiceChannel(voiceID, function () {
                        var oldlevel = logger.level
                        logger.level = 'error'
                        bot.disconnect();
                        bot.connect();
                        logger.level = oldlevel
                    });
                } catch (e) {
                    logger.warn("Leaving VC - " + e)
                }
                voiceLock = false;
            });
        }
    });
}

function finished(mp3) {
    bot.leaveVoiceChannel(voiceID, function () {
        if (alreadyFired == false) {
            alreadyFired = true;
            try {
                fs.unlinkSync(mp3);
            } catch (e) {
                logger.warn(e);
            }
            audioDone = true
        }
    });
}

function playAudio(mp3, channelID) {
    bot.leaveVoiceChannel(voiceID, function () {
        try {
            bot.joinVoiceChannel(voiceID, function (error, events) {
                if (error) throw error;
                bot.getAudioContext(voiceID, function (error, stream) {
                    if (error) throw error;
                    try {
                        fs.createReadStream(mp3).pipe(stream, {
                            end: false
                        });
                    } catch (e) {
                        audioError(e, channelID)
                    }
                    alreadyFired = false;
                    stream.on('done', function () {
                        finished(mp3)
                    });
                });
            });
        } catch (e) {
            audioError(e, channelID);
        }
    });
}

function resetErrors() {
    audioErrors = 0;
    logger.debug("audioErrors counter reset.")
}

function audioError(error, channelID) {
    if (audioErrors == 0) {
        setTimeout(resetErrors, 120000)
    }
    audioErrors++;
    logger.error(error);
    bot.sendMessage({
        to: channelID,
        message: "Error occured playing audio:\n```" + error + "```"
    }, function () {
        bot.leaveVoiceChannel(voiceID, function () {
            bot.disconnect();
            bot.connect();
        });
    });
    voiceLock = false;
    if (audioErrors > maxerrors) {
        bot.sendMessage({
            to: channelID,
            message: "Maximum number of errors allowed for timeframe has been exceeded."
        }, function (channelID) {
            safeMode(channelID);
        });
    }
}

function deleteLogs(channel_id) {
    try {
        fs.unlinkSync("./happenings.log"); //Clear log
        bot.sendMessage({
            to: channel_id,
            message: "Log file deleted."
        });
        logger.info("Logs were cleared.")
        fs.writeFileSync("happenings.log", "Log file cleared and recreated.");
    } catch (e) {
        logger.warn("Unable to unlink log file.");
        logger.warn("Exra data:    " + e);
        bot.sendMessage({
            to: channel_id,
            message: "Error occurred unlinking specified file: `" + e + "`"
        });
    }
    logger.remove(logger.transports.File);
    logger.add(logger.transports.File, {
        filename: "happenings.log"
    });
}

function postQuote(channelID, parameters, quote) {
    if (parameters == "tts") {
        if (ttsquote != "yes") {
            throw "Quote `/tts` is disabled on this bot."
        }
        quote = "/tts " + quote;
    }
    bot.sendMessage({
        to: channelID,
        message: quote
    })
}

//Here we create our bot variable, this is what we're going to use to communicate to Discord.
var bot = new droid.Client({
    autorun: true,
    token: token
});
logger.verbose("Client created.");

function notice(channel_id) {
    logger.warn("Sending notice.");
    if (config.account.greet == "yes") {
        postGenerals("The HAL9000 bot is now going offline. Goodbye and thanks for all the fish!");
    }
    dumpLogs(channel_id);
    bot.setPresence({
        game: {
            name: "Shutting down..."
        }
    });
}

function dumpLogs(channel_id) {
    var data;
    var trimmed;
    try {
        data = String(fs.readFileSync('./happenings.log', 'utf8'));
        trimmed = "```" + data.slice(-1000) + "```";
        bot.sendMessage({
            to: channel_id,
            message: "Last snippet of logs: " + trimmed
        }, function (e, r) {
            turnOff(e, r);
        });
        logger.verbose("Logs dumped successfully.");
    } catch (e) {
        logger.warn("Unable to dump logs: " + e);
        bot.sendMessage({
            to: channel_id,
            message: "Unable to dump logs:\n``` " + e + "```"
        }, function (f, r) {
            turnOff(f, r);
        });
    }
}

function turnOff(error, response) {
    try {
        if (error.length > 0) {
            logger.warn("Error sending message: " + error);
        }
    } catch (e) {
        logger.debug("No errors occured sending message.");
    }
    try {
        exec("sync");
    } catch (e) {
        logger.warn("Unable to sync filesystem. Is this perhaps a Windows system?");
    }
    bot.disconnect();
    bot = undefined;
    process.exit();
}

function sendHelp(channelID, i) {
    bot.sendMessage({
        to: channelID,
        message: usage[i]
    }, function (e, r) {
        if (i < usage.length) {
            i++
            sendHelp(channelID, i);
        }
    });
}

function sendSafe(channelID) {
    bot.sendMessage({
        to: channelID,
        message: limited
    });
}


var true_startup = true;
var resetting = false;
var notifyChannelID;

bot.on("ready", function (event) {
    if (true_startup == true) {
        true_startup == false;
        logger.verbose("Socket connected.");
        logger.info("Logged in as: " + bot.username + " - (" + bot.id + ")");
        if (startup == true) {
            startup = false;
            if (config.account.greet == "yes") {
                postGenerals(messageGreet());
            }
        }
        bot.setPresence({
            game: {
                name: bot_game
            }
        });
    } else if (resetting == true) {
        bot.sendMessage({
            to: notifyChannelID,
            message: "Reconnect completed."
        });
    }
});

//Failsafe stuff.
bot.on('disconnect', function (errMsg, code) {
    if (errMsg != "Manual disconnect") {
        logger.warn("Client disconnected from Discord.");
        logger.warn(errMsg);
        logger.debug(String(code));
        logger.info("Attempting to (re)connect.");
        logger.verbose("Connection attempted.");
    }
    bot.setPresence({
        game: {
            name: bot_game
        }
    });
    bot.connect();
});

//In this function we're going to add our commands.
bot.on("message", function (user, userID, channelID, message, event) {
    if (whitelist.includes(channelID) == true) {
        if (message.substring(0, 1) == prefix) {
            var options = message.substring(1).split(" ");
            var command = options[0];
            var parameters = "";
            var paramArray = [];
            try {
                parameters = message.substring(message.indexOf(' ') + 1);
            } catch (e) {
                parameters = "";
            }
            options = options.splice(1);
            logger.info("Message: " + message + "          Command: " + command + "          Parameters: " + parameters);
            logger.verbose("User: " + user + "          userID: " + userID + "          to: " + channelID);
            try {
                paramArray = parameters.split(" ")
                if (command == "open") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (parameters == "the pod bay doors") {
                        bot.sendMessage({
                            to: channelID,
                            message: "I'm sorry, " + user + ". I'm afraid I can't do that."
                        });
                    };
                };
                if (message == "!snail" | message == "!s" | message == "!S" | message == "!SNAIL") {
                    if (safe_mode != true) {
                        var race_command;
                        if (paramArray[0] == "race" | paramArray[0] == "RACE") {
                            race_command = true;
                        }
                        if (race_command == true && snail_race == "yes") {
                            bot.sendMessage({
                                to: channelID,
                                message: "!s enter"
                            });
                        };
                    }
                };
                if (command == "help") {
                    var i = 0;
                    if (safe_mode == false) {
                        sendHelp(channelID, i);
                    } else {
                        sendSafe(channelID);
                    }
                }
                if (command == "moo") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    bot.sendMessage({
                            to: channelID,
                            message: cow
                        },
                        function (error, response) {
                            logger.verbose(response);
                        });
                }
                if (command == "shutdown") {
                    if (userID == owner) {
                        notice(channelID);
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "You don't look like @" + your_account + ". I will not accept control commands from you."
                        })
                    }
                }
                if (command == "reconfig") {
                    reloadConfig(channelID);
                }
                if (command == "reset") {
                    notifyChannelID = channelID;
                    resetting = true;
                    bot.disconnect();
                }
                if (command == "clear") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (userID == owner) {
                        deleteLogs(channelID);
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "`Refusing. You are not @" + your_account + "."
                        })
                    }
                }
                if (command == "exception") {
                    throw "Exception test invoked by " + user;
                }
                if (command == "xkcd") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (Number(paramArray[0]) > 0) {
                        logger.debug("xkcd Comic#: " + paramArray[0]);
                        xkcd.get(paramArray[0], function (error, response) {
                            if (error) {
                                var output = clogged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                                logger.warn("xkcd error:          " + error);
                            } else {
                                logger.debug("xkcd response:          " + response);
                                var title = response.safe_title;
                                var id = response.num;
                                var img = response.img;
                                var alt = response.alt;
                                var perma = "http://m.xkcd.com/" + id;
                                var output = "**" + id + ":** " + title + "\n\n" + img + "\n\n*" + alt + "*\n\nPermalink: " + perma + "\n\n.";
                                if (id == undefined) {
                                    throw "Bad response from xkcd."
                                }
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                            }
                        });
                    } else if (paramArray[0] == "random") {
                        xkcd.random(function (error, response) {
                            if (error) {
                                var output = cloggged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                                logger.warn("xkcd error:          " + error);
                            } else {
                                logger.debug("xkcd response:          " + response);
                                var title = response.safe_title;
                                var id = response.num;
                                var img = response.img;
                                var alt = response.alt;
                                var perma = "http://m.xkcd.com/" + id;
                                var output = "**" + id + ":** " + title + "\n\n" + img + "\n\n*" + alt + "*\n\nPermalink: " + perma + "\n\n.";
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                            }
                        });
                    } else {
                        xkcd.latest(function (error, response) {
                            if (error) {
                                var output = clogged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                                throw error
                            } else {
                                logger.debug("xkcd response:" + response);
                                var title = response.safe_title;
                                var id = response.num;
                                var img = response.img;
                                var alt = response.alt;
                                var perma = "http://m.xkcd.com/" + id;
                                var output = "**" + id + ":** " + title + "\n\n" + img + "\n\n*" + alt + "*\n\nPermalink: " + perma + "\n\n.";
                                bot.sendMessage({
                                    to: channelID,
                                    message: output
                                });
                            }
                        });
                    }
                }
                if (command == "search") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (googlesearch != "yes") {
                        throw "Google Search has been disabled by the bot owner."
                    }
                    logger.debug("Google query: " + parameters);
                    googleSearch.build({
                            q: parameters,
                            start: 5,
                            fileType: "",
                            gl: "", //geolocation, 
                            lr: language,
                            num: results, // Number of search results to return between 1 and 10, inclusive 
                            siteSearch: "" // Restricts results to URLs from a specified site 
                        },
                        function (error, response) {
                            var results;
                            var title;
                            var snippet;
                            var url;
                            var output;
                            try {
                                results = response;
                                title = results.items[0].title;
                                snippet = results.items[0].snippet;
                                url = results.items[0].link;
                                output = "**" + title + "**\n\n*" + snippet + "*\n\n" + url + "\n\nMore results: https://www.google.co.th/search?q=" + encodeURI(parameters) + "\n\n";
                                logger.debug("Google response:          " + response);
                            } catch (e) {
                                output = google_fail + e + "```";
                                logger.warn("Google error:          " + error);
                            }
                            bot.sendMessage({ //We're going to send a message!
                                to: channelID,
                                message: output
                            });
                        }
                    );
                }
                if (command == "rick") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (paramArray[0] == "roll") {
                        bot.sendMessage({
                            to: channelID,
                            message: never_gonna_give_you_up
                        });
                    } else if (paramArray[0] == "lyrics") {
                        bot.sendMessage({
                            to: channelID,
                            message: lyrics
                        });
                    } else if (paramArray[0] == "gif") {
                        bot.sendMessage({
                            to: channelID,
                            message: gif
                        });
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: rick
                        });
                    }
                }
                if (command == "debug") {
                    var workDump = new Worker("debug-dump.js")
                    workDump.onmessage = function(ev) {
                        try {
                            if (ev.data.e) {
                                throw ev.data.e
                            }
                            bot.sendMessage({
                                to: channelID,
                                message: ev.data.d
                            });
                        } catch (e) {
                            logger.warn("Unable to dump logs: " + e);
                            bot.sendMessage({
                                to: channelID,
                                message: "Unable to dump logs:\n``` " + e + "```"
                            });
                        }
                        workDump.terminate()
                    }
                    workDump.postMessage();
                }
                if (command == "borg") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: "*Dev's note: This function was created back when this bot was spread across three accounts and designed for a single server. This message used to be sent from an account called The Borg Collective. It's probably less impressive now.*\n\n" + hail
                    });
                }
                if (command == "videos") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: "The YouTube bot's channel feed has been deprecated. Please enjoy this masterpiece instead:\nhttps://www.youtube.com/watch?v=7FkpM4FWa8A"
                    })
                }
                if (command == "quote") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (qodapi != "yes") {
                        throw "Quote-of-the-day is disabled by the bot owner."
                    }
                    var output;
                    fetch('http://quotes.rest/qod.json?category=funny').then(res => res.json()).then(body => postQuote(channelID, paramArray[0], body.contents.quotes[0].quote));
                }
                if (command == "audio") {
                    bot.sendMessage({
                        to: channelID,
                        message: "The whole local audio file playback system has been removed. It was next to useless."
                    });
                }
                if (command == "next") {
                    if (audio_player != "yes" && yt_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    try {
                        if (voiceLock == true) {
                            bot.leaveVoiceChannel(voiceID);
                            bot.sendMessage({
                                to: channelID,
                                message: "Web RTC terminated on request of user " + user
                            }, function () {
                                var oldlevel = logger.level
                                logger.level = "error"
                                bot.disconnect()
                                bot.connect()
                                logger.level = oldlevel
                            });
                        }
                    } catch (e) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Unable to leave voice channel. Is " + bot_name + " even in it?\n" + e
                        });
                    }
                }
                if (command == "leave") {
                    if (voiceLock == true) {
                        songarray = [songarray[0]]
                        bot.leaveVoiceChannel(voiceID);
                        bot.sendMessage({
                            to: channelID,
                            message: "Web RTC terminated on request of user " + user
                        }, function () {
                            var oldlevel = logger.level
                            logger.level = "error"
                            bot.disconnect()
                            bot.connect()
                            logger.level = oldlevel
                        });
                    }
                }
                if (command == "set_voice") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (audio_player != "yes" && yt_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    if (voiceLock == true) {
                        throw "Refusing to change voice channel while audio stream is active, as it can lead to side effects.";
                    }
                    try {
                        if (paramArray[0].length == 18) {
                            newVoice = paramArray[0];
                            bot.sendMessage({
                                to: channelID,
                                message: "Voice channel set to " + newVoice
                            });
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: "Invalid input. Must be a valid Discord voice channel ID (18 digit identifier)."
                            })
                        }
                    } catch (e) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Input must be a valid Discord voice channel ID.\n```" + e + "```"
                        })
                    }
                }
                if (command == "switch_voice") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (audio_player != "yes" && yt_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    if (voiceLock == true) {
                        throw "Refusing to change voice channel while audio stream is active, as it can lead to annoying side effects.";
                    }
                    try {
                        if (Number(paramArray[0]) > -1) {
                            var newIndex = Number(paramArray[0]) - 1;
                            if (newIndex < voices.length) {
                                newVoice = voices[newIndex];
                                bot.sendMessage({
                                    to: channelID,
                                    message: "Voice channel set to " + newVoice
                                });
                            } else {
                                bot.sendMessage({
                                    to: channelID,
                                    message: prefix + "list_voice"
                                });
                            }
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: "Usage: `switch_voice <selection>`\n\nlist_voice"
                            });
                        }
                    } catch (e) {
                        bot.sendMessage({
                            to: channelID,
                            message: "Usage: `switch_voice <selection>` Type `list_voice` to see available selectors."
                        });
                    }
                }
                if (command == "list_voice") {
                    if (audio_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    var output = "List of configured voice channels (selector code in the left):\n";
                    var i = 0;
                    for (const value of voice_names) {
                        i++;
                        output = output + String(i) + "   " + value + "\n";
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: output
                    });
                }
                if (command == "playlist") {
                    var songsout = "List of audio files currently in playlist:\n";
                    var t = 0;
                    for (const s of songarray) {
                        t++;
                        songsout = songsout + String(t) + ' `' + s.audioFile + '`\n'
                    }
                    if (t > 0) {
                        bot.sendMessage({
                            to: channelID,
                            message: songsout
                        });
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Playlist is empty."
                        })
                    }
                }
                if (command == "stream") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (yt_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    /*if (audio_playing == true) {
                        throw "Audio is already playing.";
                    }*/
                    voiceID = newVoice;
                    bot.sendMessage({
                        to: channelID,
                        message: "Adding YouTube video with ID `" + paramArray[0] + "` to download list. It may take a bit to download."
                    });
                    downloadVideo(paramArray[0], channelID);
                }
                if (command == "yt") {
                    if (safe_mode == true) {
                        throw "Command not available in safe mode."
                    }
                    if (yt_player != "yes") {
                        throw "Function is disabled by bot owner."
                    }
                    /*if (audio_playing == true) {
                        throw "Audio is already playing.";
                    }*/
                    search(parameters, opts, function (err, results) {
                        if (err) {
                            logger.error("Error occured while executing command: " + String(err));
                            bot.sendMessage({
                                to: channelID,
                                message: "Error occured while executing command: `" + String(err) + "`"
                            });
                        } else {
                            voiceID = newVoice;
                            var name = results[0].channelTitle + " - " + results[0].title;
                            downloadVideo(results[0].id, channelID);
                            bot.sendMessage({
                                to: channelID,
                                message: "Found `" + results[0].title + "` uploaded by `" + results[0].channelTitle + "`. Downloading from YouTube. Please be patient."
                            });
                        }
                    });
                }
                if (command == "safemode" && safe_mode == false) {
                    if (userID == owner) {
                        safeMode(channelID);
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "You don't look like @" + your_account + ". I will not accept control commands from you."
                        })
                    }
                }
                if (command == "force_normal" && safe_mode == true) {
                    if (userID == owner) {
                        normalMode(channelID, false);
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Your userID of `" + userID + "` does not match owner's ID of `" + owner + "`. Access denied."
                        })
                    }
                }
                if (command == "roll") {
                    if (paramArray[0] != prefix + "roll") {
                        bot.sendMessage({
                            to: channelID,
                            message: String(rollDie(Number(paramArray[0])))
                        });
                    } else {
                        bot.sendMessage({
                            to: channelID,
                            message: String(rollDie())
                        });
                    }
                }
                if (command == "gmean") {
                    if (paramArray.length == 2 && Number(paramArray[1]) != NaN) {
                        var first = Number(paramArray[0]);
                        var second = Number(paramArray[1]);
                        var result = geometricMean(first, second);
                        var output = String(result)
                        if (result == 1) {
                            if (first > 100000 | second > 100000) {
                                output = output + "\n\nThe above result may not be correct. Large values are known to exceed the module's heap."
                            }
                        } else if (output == "NaN") {
                            output = output + "\n\nThis means that the values entered resulted in something impossible."
                        }
                        bot.sendMessage({
                            to: channelID,
                            message: output
                        });
                    } else {
                        throw "Invalid input. Syntax for geometric mean module: " + prefix + "geom <value> <value>"
                    }
                }
                if (command == "hypot") {
                    if (paramArray.length == 2 && Number(paramArray[1]) != NaN) {
                        var first = Number(paramArray[0]);
                        var second = Number(paramArray[1]);
                        var result = pythagoras.computeHyp(first, second);
                        var output = String(result)
                        if (result == 1) {
                            if (first > 100000 | second > 100000) {
                                output = output + "\n\nThe above result may not be correct. Large values are known to exceed the module's heap."
                            }
                        } else if (output == "NaN") {
                            output = output + "\n\nThis means that the values entered resulted in something impossible."
                        }
                        bot.sendMessage({
                            to: channelID,
                            message: output
                        });
                    } else {
                        throw "Invalid input. Syntax for Pythagorean hypotenuse: " + prefix + "hypot <leg> <leg>"
                    }
                }
                if (command == "leg") {
                    if (paramArray.length == 2 && Number(paramArray[1]) != NaN) {
                        var first = Number(paramArray[0]);
                        var second = Number(paramArray[1]);
                        var result = pythagoras.computeLeg(first, second);
                        var output = String(result)
                        if (result == 1) {
                            if (first > 100000 | second > 100000) {
                                output = output + "\n\nThe above result may not be correct. Large values are known to exceed the module's heap."
                            }
                        } else if (output == "NaN") {
                            output = output + "\n\nThis means that the values entered resulted in something impossible."
                        }
                        bot.sendMessage({
                            to: channelID,
                            message: output
                        });
                    } else {
                        throw "Invalid input. Syntax for Pythagorean leg: " + prefix + "leg <known leg> <hypotenuse>"
                    }
                }
                if (command == "trig") {
                    if (paramArray.length == 1 && String(Number(paramArray[0])) != "NaN") {
                        bot.sendMessage({
                            to: channelID,
                            message: calcTrig(Number(paramArray[0]))
                        });
                    } else {
                        throw "Invalid input. Syntax for trig values: " + prefix + "trig <decimal angle in degrees>"
                    }
                }
            } catch (e) {
                logger.error("Error occured while executing command: " + String(e));
                bot.sendMessage({
                    to: channelID,
                    message: "Error occured while executing command: `" + String(e) + "`"
                })
            }
        }
    }
});