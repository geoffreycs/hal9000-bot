console.log("Beginning script execution.");

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
logger.level = 'debug';
logger.info("Normal execution beginning on " + getDateTime());

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec + " on " + month + "/" + day + "/" + year;
}

const os = require('os');
logger.info("OS loaded.")

var ini = require('ini');
logger.info("ini loaded.");
var config;
try {
    config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    logger.info("config.ini parsed.")
}
catch(e) {
    throw "Configuration file (config.ini) not found. This file is required for the bot to do anything. Refusing to continue execution."
}
var token = config.account.token;
var bot_game = config.account.game;
var owner = config.account.owner;
var your_account = config.account.your_account;
var bot_name = config.account.bot_name;
var channels = config.account.general;
var voiceID = config.account.default_voice;

//Enable or disable features
var snail_race = config.controls.snail;
var audio_player = config.controls.voice;
var yt_player = config.controls.youtube;
var qodapi = config.controls.quote;
var ttsquote = config.controls.tts;
var googlesearch  = config.controls.googlesearch;

//First of all, we need to load the dependencies we downloaded!
var droid = require("discord.io");
logger.info("Discord.io loaded.");
var xkcd = require('xkcd-api');
logger.info("xkcd-api loaded.");
var sys = require('sys');
logger.info("sys loaded");
const fetch = require('node-fetch');
logger.info("Node-fetch loaded");

//Load YouTube audio functionaility if requested
var youtube;
var stream;
var search;
var opts;
if (yt_player == "yes") {
    youtube = require("youtube-mp3-downloader");
    stream = new youtube({
        "ffmpegPath": config.audio.ffmpeg,        // Where is the FFmpeg binary located?
        "outputPath": "./",    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "lowest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });
    logger.info("YouTube MP3 Downloader loaded.");
    search = require('youtube-search');
    opts = {
        maxResults: 1,
        key: config.audio.youtube_key
    };
    logger.info("youtube-search loaded.");
}

//Prepare Google Custom Search if requested
var GoogleSearch;
var language;
var results = 1;
if (googlesearch == "yes") {
    GoogleSearch = require('google-search');
    logger.info("Google CSE API loaded.");
    googleSearch = new GoogleSearch({
        key: config.google.api_key,
        cx: config.google.api_cx
    });
    language = config.google.language;
}

//We need to set some variables for later.
var cow = '```         (__) \n         (oo) \n   /------\\/ \n  / |    ||   \n *  /\\---/\\ \n    ~~   ~~   \n...."Have you mooed today?"...```';
var usage = "Available commands:\n`!quote` - Displays funny quote-of-the-day from the Quotes REST API. Add the `tts` paramter to use Discord's `/tts` feature with it.\n`!search <query>` - Display Google result(s) for that query in the chat\n`!xkcd [comic # or 'random' ]` - Fetch latest xkcd comic, specify number to show spcified comic, or specify *`random`* to get random comic\n`!rick [parameter]` - Instant RickRoll, type *`!rick`* without extra parameter to show available options\n`!s race` or `!snail race` - Starts a normal Snail Race, but the but also joins automatically. Feature may or may not be available on this server. Requires the Snail Racing bot.\n`!open the pod bay doors` - Try it\n`!moo` - Moos\n\nVoice commands:\n`!audio [selector]` - Plays specified audio to currently set voice channel. Use without selector to see available MP3 files.\n`!leave` - Stops playing audio and leaves the voice channel.\n`!switch_voice [selector]` - Change selected voice channel.\n`!list_voice` - Lists configured voice channels.\n`!set_voice [channel_id]` - Manually set voice channel ID.\n`!stream <YouTube video ID>` - Streams the audio of the video matching the provided ID.\n`!yt <keywords>` - Streams the audio of the first video result matching the specified keywords.\n\nScript commands:\n`!reconfig` - Reload values from `config.ini`.\n`!reset` - Forces disconnect and reconnect.\n\nTesting commands:\n`!debug` - Dumps the last 2000 characters of log file to a direct message to you.\n`!execption` - For tesing purposes: Throws an exception.\n\nAdmin commands (only work if you are the owner of the bot):\n`!shutdown` - Posts a notice of going offline, dumps the last 1000 characters of the log, disconnects Discord socket, syncs filesystem, and exits NodeJS runtime.\n`!clear` - Deletes the log file.\n`!safemode` - Sets the variable to enter Safe Mode.\n\nDeprecated (no longer functional) commands:\n`!videos` - Used to display most recent videos from several meme channels.";
var clogged = "Something clogged up in the tubes. Notify @" + your_account + "if this issue persists.";
var google_fail = "An error occured. Some causes could be no results found, Google CSE API is down, or there's a bug in the code.\n\nIf this persists, contact Geoffrey at @PosixMaster#9116.\n\n\nDebug info for Geoffrey:\n```";
var startup = true;
var halboot = true;
var operation = usage;
var limited = "The bot is currently in safe mode. Available functions are limited to:\n`!reconfig` - Reload configuration.\n`!list_voice` - List configured voice channels.\n`!reset` - Disconnects and reconnects socket.\n`!debug` - Dumps the latter 2000 characters of the log file.\n`!exception` - Invokes exception for testing.\n`!shutdown` - Calls `notice()`, dumps last 1000 characters of log file, executes `sync` on POSIX/*nix, and shutsdown NodeJS instance. May only be used by bot owner.\n`!force_normal` - Forces script to reenter normal operation. May only be used by bot owner. Do not invoke unless you know what you are doing.\n\nAll other functions are currently disabled.";
var safe_mode = false;

//Stuff for the voice channel functions.
var voices = config.account.voice_id;
var voice_names = config.account.voice_name;
var audio_files = config.audio.audio_file;
var audio_names = config.audio.audio_name;
var voice_channel;
var already_sent = false;
var newVoice = voiceID;
var audio_playing = false;
var channelActive = false;

//For the !rick command.
var lyrics = "**Never Gonna Give You Up**\n\nWe're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy\n\nI just wanna tell you how I'm feeling\nGotta make you understand\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nWe've known each other for so long\nYour heart's been aching, but\nYou're too shy to say it\nInside, we both know what's been going on\nWe know the game and we're gonna play it\n\nAnd if you ask me how I'm feeling\nDon't tell me you're too blind to see\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\n(Ooh, give you up)\n(Ooh, give you up)\nNever gonna give, never gonna give\n(Give you up)\nNever gonna give, never gonna give\n(Give you up)\n\nWe've known each other for so long\nYour heart's been aching, but\nYou're too shy to say it\nInside, we both know what's been going on\nWe know the game and we're gonna play it\n\nI just wanna tell you how I'm feeling\nGotta make you understand\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you";
var never_gonna_give_you_up = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
var gif = "https://media.giphy.com/media/kFgzrTt798d2w/giphy.gif";
var rick = "Command usage:\n\n`!rick <option>`\n\nAvailable options are:\n`roll` - Self explanatory\n`lyrics` - Posts the entire lyrics of the song\n`gif` - Rick roll Giphy image\n\nType `!help` for all commands."

function reloadConfig(channelID) {
    try {
        config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
        logger.info("config.ini parsed.")
    }
    catch(e) {
        throw "Configuration file (config.ini) not found. This file is required for the bot to do anything. Refusing to continue execution."
    }
    try {
        token = config.account.token;
        bot_game = config.account.game;
        owner = config.account.owner;
        your_account = config.account.your_account;
        bot_name = config.account.bot_name;
        channels = config.account.general;
        voiceID = config.account.default_voice;
        voices = config.account.voice_id;
        voice_names = config.account.voice_name;
        audio_files = config.audio.audio_file;
        audio_names = config.audio.audio_name;
        snail_race = config.controls.snail;
        audio_player = config.controls.voice;
        yt_player = config.controls.youtube;
        qodapi = config.controls.quote;
        ttsquote = config.controls.tts;
        googlesearch  = config.controls.googlesearch;
        bot.sendMessage({
            to: channelID,
            message: "Reconfiguration success."
        });
        normalMode(channelID, true);
    }
    catch(e) {
        bot.sendMessage({
            to: channelID,
            message: "Error during setting configuration. This script may now be in a very bad, unstable, inconsistent, and unpredictable state. Correct configuration or shut down server immediately.\n```" + e + "```"
        })
        safeMode(channelID);
    }
    
}

function safeMode(channelID) {
    bot.sendMessage({
        to: channelID,
        message: "!leave"
    });
    usage = limited;
    safe_mode = true;
    bot.sendMessage({
        to: channelID,
        message: "Safe mode activated."
    });
}

function normalMode(channelID, success) {
    var output = "Caution: Safe Mode was automatically activated due to a misconfiguration. However, Safe Mode was manually disabled by the owner. Proceed with caution, as the script may be unstable.";
    if (success == true) {
        output = "Safe Mode automatically exited. Normal operation has resumed. Have a nice day!"
    }
    safe_mode = false;
    usage = operation;
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

function chooseAudio(parameters, channelID) {
    try {
        if (Number(parameters) > -1) {
            var newIndex = Number(parameters) - 1;
            if (newIndex < audio_files.length) {
                playAudio(audio_files[newIndex], channelID, false);
            }
            else {
            var output = "Usage: `!audio <option>`\n\nList of configured options are:\n";
            var i = 0;
            for (const value of audio_names) {
                i++;
                output = output + String(i) + "   " + value + "\n";
            }
            bot.sendMessage({
                to: channelID,
                message: output
            });
            }
        }
        else {
            var output = "Usage: `!audio <option>`\n\nList of configured options are:\n";
            var i = 0;
            for (const value of audio_names) {
                i++;
                output = output + String(i) + "   " + value + "\n";
            }
            bot.sendMessage({
                to: channelID,
                message: output
            });
        }
    }
    catch(e) {
        var voice_channel = "null";
        audioError(e, channelID, voice_channel);
    }
}

function downloadVideo(parameters, channelID) {
    var output = "Downloading from YouTube. This may take a moment.";
    logger.debug(output)
    stream.download(parameters);
    bot.sendMessage({
        to: channelID,
        message: output
    })
    stream.on("finished", function(err, data) {
        playAudio(data.file, channelID, true);
    });
    stream.on("error", function(error) {
        var voice_channel = "null";
        audioError(error, channelID, voice_channel);
    });
}

function playAudio(mp3, channelID, erase) {
    try {
        audio_playing = true;
        already_sent = false;
        voice_channel = voiceID;
        if (channelActive == false) {
            bot.sendMessage({
                to: channelID,
                message: "Playing `" + mp3 + "`."
            });
            //Let's join the voice channel, the ID is whatever your voice channel's ID is.
            bot.joinVoiceChannel(voice_channel, function(error, events) {
                //Check to see if any errors happen while joining.
                if (error) return audioError(error, channelID, voice_channel);
                //Then get the audio context
                bot.getAudioContext(voice_channel, function(error, stream) {
                    //Once again, check to see if any errors exist
                    if (error) return audioError(error, channelID, voice_channel);
                    //Create a stream to your file and pipe it to the stream
                    fs.createReadStream(mp3).pipe(stream, {
                        end: false
                    });
                    //The stream fires `done` when it's got nothing else to send to Discord.
                    stream.on('done', function() {
                        bot.leaveVoiceChannel(voice_channel);
                        if (already_sent == false) {
                            already_sent = true;
                            bot.sendMessage({
                                to: channelID,
                                message: "End of stream. Web RTC terminated."
                            });
                        }
                        try {
                            if (erase == true) {
                                fs.unlinkSync(mp3);
                            }
                        }
                        catch(e) {
                            logger.info(e);
                        }
                        audio_playing = false;
                        channelActive = false;
                    });
                });
            });
            channelActive = true;
        }
    }
    catch(e) {
        var voice_channel = "null";
        audioError("Internal file error.\n" + e, channelID, voice_channel);
    }
}

function audioError(error, channelID, voice_channel) {
    logger.error(error);
    bot.sendMessage({
        to: channelID,
        message: "Error occured playing audio:\n```" + error + "```" 
    })
    return "Something happened."
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
    if (ttsquote != "yes") {
        throw "Quote `/tts` is disabled on this bot."
    }
    if (parameters == "tts") {
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
logger.info("Client created.");

function notice(channel_id) {
    logger.warn("Sending notice.");
    postGenerals("The HAL9000 bot is now going offline. Goodbye and thanks for all the fish!");
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
        }, function(e, r) {
            turnOff(e, r);
        });
        logger.info("Logs dumped successfully.");
    } catch (e) {
        logger.warn("Unable to dump logs: " + e);
        bot.sendMessage({
            to: channel_id,
            message: "Unable to dump logs:\n``` " + e + "```"
        }, function(f, r) {
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
    }
    catch(e) {
        logger.info("Unable to sync filesystem. Is this perhaps a Windows system?");
    }
    bot.disconnect();
    bot = undefined;
    process.exit(-1);
}

bot.on("ready", function(event) {
    logger.info("Socket connected.");
    logger.info("Logged in as: " + bot.username + " - (" + bot.id + ")");
    if (startup == true) {
        startup = false;
        postGenerals(messageGreet());
    }
    bot.setPresence({
        game: {
            name: bot_game
        }
    });
});

//Failsafe stuff.
bot.on('disconnect', function(errMsg, code) {
    should = false;
    logger.warn("Client disconnected from Discord.");
    logger.error(errMsg);
    logger.debug(String(code));
    logger.verbose("Attempting to (re)connect.");
    bot.connect();
    logger.info("Connection attempted.");
    bot.setPresence({
        game: {
            name: bot_game
        }
    });
});

//In this function we're going to add our commands.
bot.on("message", function(user, userID, channelID, message, event) {
    if (message.substring(0, 1) == "!") {
        var arguments = message.substring(1).split(" ");
        var command = arguments[0];
        var parameters = "";
        try {
            parameters = message.substring(message.indexOf(' ') + 1);
        } catch (e) {
            parameters = "";
        }
        arguments = arguments.splice(1);
        logger.info("Message: " + message + "          Command: " + command + "          Parameters: " + parameters);
        logger.info("User: " + user + "          userID: " + userID + "          channelID: " + channelID);
        try {
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
            if (command == "snail" | command == "s") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                if (parameters == "race" && snail_race == "yes") {
                    bot.sendMessage({
                        to: channelID,
                        message: "!s enter"
                    });
                    setTimeout(function() {
                        bot.sendMessage({
                            to: channelID,
                            message: "!snail open"
                        });
                    }, 39000); //Should be enough time for the race to finish.
                };
            };
            if (command == "help") {
                bot.sendMessage({
                    to: channelID,
                    message: usage
                });
            }
            if (command == "moo") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                bot.sendMessage({
                        to: channelID,
                        message: cow
                    },
                    function(error, response) {
                        logger.info(response);
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
                if (Number(parameters) > 0) {
                    logger.info("xkcd Comic#: " + parameters);
                    xkcd.get(parameters, function(error, response) {
                        if (error) {
                            var output = clogged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                            bot.sendMessage({
                                to: channelID,
                                message: output
                            });
                            logger.warn("xkcd error:          " + error);
                        } else {
                            logger.info("xkcd response:          " + response);
                            var title = response.safe_title;
                            var id = response.num;
                            var img = response.img;
                            var alt = response.alt;
                            var perma = "http://m.xkcd.com/" + id;
                            var output = "**" + id + ":** " + title + "\n\n" + img + "\n\n*" + alt + "*\n\nPermalink: " + perma + "\n\n.";
                            if (id == undefined){
                                throw "Bad response from xkcd."
                            }
                            bot.sendMessage({
                                to: channelID,
                                message: output
                            });
                        }
                    });
                } else if (parameters == "random") {
                    xkcd.random(function(error, response) {
                        if (error) {
                            var output = cloggged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                            bot.sendMessage({
                                to: channelID,
                                message: output
                            });
                            logger.warn("xkcd error:          " + error);
                        } else {
                            logger.info("xkcd response:          " + response);
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
                    xkcd.latest(function(error, response) {
                        if (error) {
                            var output = clogged + "\nThe exact error returned from `xkcd-api` was:\n```" + error + "```";
                            bot.sendMessage({
                                to: channelID,
                                message: output
                            });
                            logger.warn("xkcd error:          " + error);
                        } else {
                            logger.info("xkcd response:          " + response);
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
                logger.info("Google query: " + parameters);
                googleSearch.build({
                        q: parameters,
                        start: 5,
                        fileType: "",
                        gl: "", //geolocation, 
                        lr: language,
                        num: results, // Number of search results to return between 1 and 10, inclusive 
                        siteSearch: "" // Restricts results to URLs from a specified site 
                    },
                    function(error, response) {
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
                            logger.info("Google response:          " + response);
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
                if (parameters == "roll") {
                    bot.sendMessage({
                        to: channelID,
                        message: never_gonna_give_you_up
                    });
                }  else if (parameters == "lyrics") {
                    bot.sendMessage({
                        to: channelID,
                        message: lyrics
                    });
                } else if (parameters == "gif") {
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
                var data;
                var trimmed;
                try {
                    data = String(fs.readFileSync('./happenings.log', 'utf8'));
                    trimmed = "```" + data.slice(-1994) + "```";
                    bot.sendMessage({
                        to: channelID,
                        message: trimmed
                    });
                    logger.info("Logs dumped successfully.");
                } catch (e) {
                    logger.warn("Unable to dump logs: " + e);
                    bot.sendMessage({
                        to: channelID,
                        message: "Unable to dump logs:\n``` " + e + "```"
                    });
                }
            }
            if (command == "borg") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                bot.sendMessage({
                    to: channelID,
                    message: hail
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
                fetch('http://quotes.rest/qod.json?category=funny').then(res => res.json()).then(body => postQuote(channelID, parameters, body.contents.quotes[0].quote));
            }
            if (command == "audio") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                if (audio_player != "yes") {
                    throw "Function is disabled by bot owner."
                }
                voiceID = newVoice;
                chooseAudio(parameters, channelID);
            }
            if (command == "leave") {
                if (audio_player != "yes" && yt_player != "yes") {
                    throw "Function is disabled by bot owner."
                }
                try {
                    already_sent = true;
                    bot.leaveVoiceChannel(voiceID);
                    bot.sendMessage({
                        to: channelID,
                        message: "Web RTC terminated on request of user " + user
                    })
                }
                catch(e) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Unable to leave voice channel. Is " + bot_name + " even in it?\n" + e
                    })
                }
            }
            if (command == "set_voice") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                if (audio_player != "yes" && yt_player != "yes") {
                    throw "Function is disabled by bot owner."
                }
                if (audio_playing == true) {
                    throw "Refusing to change voice channel while audio stream is active, as it can lead to annoying side effects.";
                }
                try {
                    if (parameters.length == 18) {
                        newVoice = parameters;
                        bot.sendMessage({
                            to: channelID,
                            message: "Voice channel set to " + newVoice
                        });
                    }
                    else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Invalid input. Must be a valid Discord voice channel ID (18 digit identifier)."
                        })
                    }
                }
                catch(e) {
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
                if (audio_playing == true) {
                    throw "Refusing to change voice channel while audio stream is active, as it can lead to annoying side effects.";
                }
                try {
                    if (Number(parameters) > -1) {
                        var newIndex = Number(parameters) - 1;
                        if (newIndex < voices.length) {
                            newVoice = voices[newIndex];
                            bot.sendMessage({
                                to: channelID,
                                message: "Voice channel set to " + newVoice
                            });
                        }
                        else {
                            bot.sendMessage({
                                to: channelID,
                                message: "!list_voice"
                            });
                        }
                    }
                    else {
                        bot.sendMessage({
                            to: channelID,
                            message: "Usage: `!switch_voice <selection>`\n\n!list_voice"
                        });
                    }
                }
                catch(e) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Usage: `!switch_voice <selection>` Type `!list_voice` to see available selectors."
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
            if (command == "stream") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                if (yt_player != "yes") {
                    throw "Function is disabled by bot owner."
                }
                if (audio_playing == true) {
                    throw "Audio is already playing.";
                }
                voiceID = newVoice;
                downloadVideo(parameters, channelID);
            }
            if (command == "yt") {
                if (safe_mode == true) {
                    throw "Command not available in safe mode."
                }
                if (yt_player != "yes") {
                    throw "Function is disabled by bot owner."
                }
                if (audio_playing == true) {
                    throw "Audio is already playing.";
                }
                search(parameters, opts, function(err, results) {
                    if(err) throw err;
                   
                    voiceID = newVoice;
                    downloadVideo(results[0].id, channelID);
                    bot.sendMessage({
                        to: channelID,
                        message: "Found " + results[0].title + " uploaded by " + results[0].channelTitle + "."
                    });
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
        }
        catch(e) {
            logger.error("Error occured while executing command: " + String(e));
            bot.sendMessage({
                to: channelID,
                message: "Error occured while executing command: `" + String(e) + "`"
            })
        }
    }
});
