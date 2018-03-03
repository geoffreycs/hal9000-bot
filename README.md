# HAL9000 Discord Bot
#### A bot that does random things

## Features
* Retrieve a funny [Quote of the Day](http://quotes.rest/#!/qod/get_qod) from the [Quotes REST service](http://quotes.rest/), as well as speak it using [Discord's Text-to-Speech feature](https://support.discordapp.com/hc/en-us/articles/212517297-Text-to-Speech-101).
* Search Google and post the first result.
* Retrieve [xkcd](http://www.xkcd.com) webcomics.
* Instant [Rick Roll](https://en.wikipedia.org/wiki/Rickrolling).
* Automatically join Snail Races if your server has [the Snail Racing bot](https://bots.discord.pw/bots/256556410031046657).
* Stream local audio files into voice channels.
* Stream YouTube into voice channels.
* Reload the configuration store without restarting the bot.
* Automatically enters Safe Mode if the reloaded configuration is invalid.
* Logging output to file.
* Remotely do a partial dump of the log file.
* Remotely reset or shutdown the bot.
* Obligatory [2001 reference](https://www.youtube.com/watch?v=ARJ8cAGm6JE).
* Obligatory [Linux joke](http://knowyourmeme.com/photos/902013-linux).  
* Feature not on the list? [Request it with a GitHub issue!](https://github.com/geoffreycs/hal9000-bot/issues)

### Too lazy to install?
You can join my Discord server which has HAL9000 running already: <https://discord.gg/QxgYfw8>. And your own bots won't be allowed. Sorry.

## HAL9000 Uses

* The practically magical library [Discord.io](https://github.com/izy521/discord.io) by [izy521](https://github.com/izy521), specifically the [gateway v6 fork](https://github.com/Woor/discord.io/tree/gateway_v6) by [Woor](https://github.com/Woor)
* [75lb](https://www.npmjs.com/~75lb)'s [command-line-arguments](https://www.npmjs.com/package/command-line-args)
* [google-search](https://www.npmjs.com/package/google-search) by [Aykut Yaman](https://www.npmjs.com/~aykutyaman)
* An aptly-named INI parser called [ini](https://www.npmjs.com/package/ini) written by [isaacs](https://www.npmjs.com/~isaacs)
* [node-fetch](https://www.npmjs.com/package/node-fetch) by [Timothy Gu](https://www.npmjs.com/~timothygu) and [David Frank, AKA bitinn](https://www.npmjs.com/~bitinn)
* [sync-exec](https://www.npmjs.com/package/sync-exec) by [gvarsanyi](https://www.npmjs.com/~gvarsanyi)
* The [Winston](https://www.npmjs.com/package/winston) logging library by [serveral people](https://www.npmjs.com/package/winston/access)
* [xkcd-api](https://www.npmjs.com/package/xkcd-api) by [sidhantpanda](https://www.npmjs.com/~sidhantpanda)
* [Youtube MP3 Downloader](https://www.npmjs.com/package/youtube-mp3-downloader) by [ytb2mp3](https://github.com/ytb2mp3)
* [youtube-search](https://www.npmjs.com/package/youtube-search) by [maxgfeller](https://www.npmjs.com/~maxgfeller)
* [FFmpeg](https://www.ffmpeg.org/) by [The FFmpeg project](https://www.ffmpeg.org/contact.html#MailingLists)

## Installation

### Install NodeJS
The bot is written for [NodeJS](https://nodejs.org/en/), a [JavaScript](https://www.w3schools.com/js) runtime based on [Google's V8 engine](https://developers.google.com/v8/) used in [Chrome](https://www.google.com/chrome/), [Opera](http://www.opera.com/), and [Vivaldi](https://vivaldi.com/?lang=en_US). In order to use the bot, you must have NodeJS installed first. To install Node, [please download the appropriate file for your system](https://nodejs.org/en/download/). On Windows, [you need to add Node and NPM to your `%PATH%`](https://stackoverflow.com/a/27864253).

### Get the HAL9000 Bot

Next, you need to download the actual bot. You can download it as a [zip file from GitHub](https://github.com/geoffreycs/hal9000-bot/archive/master.zip), or you can use the command-line `git` program:
```
$ git clone https://github.com/geoffreycs/hal9000-bot.git
```
If you downloaded the zip file, unpack it. Either method, move into the directory where `bot.js` and the other main files are located. If you are on Windows and doing this with File Explorer, hold down `Shift` while right-clicking on a blank space, and choose "Open command window here." On Linux or another *nix system, your file manager may have an option to open in the terminal. If not, open the terminal manually and `cd` into the directory.  
Once you are in the correct directory in a command line, install the dependencies with:
```
$ npm install
```
Now open up `config.ini` with your favorite text editing software and set the correct options. See the Configuration File Usage section for how to properly configure your bot.  
Once configuration is complete, it is now time to run your bot, granted that you've added it to at least one server.

## Command Line Usage
```node bot.js [[--config] <./path/to/config/file.ini>]```  
### Options
```--config``` - Allows user to specify an INI configuration file. Not required.  
```./path/to/config/file.ini``` - Path to INI configuration file. May be passed with or without `--config` flag. If not passed, configuration file defaults to `./config.ini`.  
### Examples
```
$ node bot.js --config alt.ini
$ node bot.js alt.ini 
$ node bot.js
```

## Configuration File Usage
### Main Config Store
#### `[account]`
`token = ` - Here you need to specify your Discord account token. For information on how to get that token, see [this page if you are using a normal account](https://github.com/TheRacingLion/Discord-SelfBot/wiki/Discord-Token-Tutorial) or [this page if you want to use a bot account](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token).  
`game = ` - Set the title of the game you want the bot to appear to be "playing."  
`general[] = ` - Set the ID of the #general text channel, or whichever channel you want the bot to announce its presence on. To get the IDs, in Discord, go to "User Settings" > "Appearance," scroll down, and turn on "Developer Mode." To get the ID of the intended channel, right-click its name in the left pane and choose "Copy ID." You may specify multiple channels like so:
```
general[] = 265002879549440001
general[] = 269958522907787267
```  
`owner = ` - Your Discord userID. The bot will use this to identify who is its owner/admin. To get your ID, follow the steps above to turn on Developer Mode, and right-click your name in the right pane and choose "Copy ID."    
`your_account = ` - What you want the bot to call you.  
`bot_name = ` - What the bot should call itself.  
`default_voice = ` - The ID of the default voice channel the bot will connect to for its audio functions. Only required if you intend to use those functions.  
`greet = ` - Whether the bot should announce its presence on the server. Accepts `yes` or `no`.  

#### `[channels]`
`voice_id[] = ` - Specify an ID for an available voice channel the bot can connect to. Only required if you intent to use audio functionality.  
`voice_name[] = ` User-friendly name for the voice channel specified. Only required if you intent to use audio functionality. Like the `general[]` option, you can specify multiple ID/name pairs:  
```
voice_id[] = 304070211139665920
voice_name[] = General
voice_id[] = 346392765640474624
voice_name[] = AFK
```  
`allowed_channels[] = ` - Specify an ID of the text channel that the bot should accept commands from. All other channels will be silently ignored. Again, you can have multiple channels:  
```
allowed_channels[] = 319233914864533516
allowed_channels[] = 320753155677749248
allowed_channels[] = 304070211139665920
```   

#### `[controls]`
`snail = ` - Toggles Snail Racing integration. Requires the [Snail Racing bot to be present](https://bots.discord.pw/bots/256556410031046657).  
`youtube = ` - Toggles YouTube audio streaming functionality. Requires YouTube Data APIv3 key.  
`googlesearch = ` - Toggles Google Search functionality. Requires both a Google API key and a Google Custom Search Engine key.  
`quote = ` - Toggles Quote-of-the-Day functionality.
`tts = ` - Toggles the `tts` parameter availability for the `!quote` command. Requires `\tts` to be enabled by the server to have any effect.  
`voice = ` - Toggles local audio streaming.  

#### `[google]`
`api_key = ` - [Google API key](https://support.google.com/googleapi/answer/6158862?hl=en). Only required to use `!search` command.  
`api_cx = ` - [Google Custom Search Engine key](https://cse.google.com/cse/all). Only required to use `!search` command.  
`language = ` - Language of search results. Example: `lang_en`. Only required to use `!search` command.  

#### `[audio]`
`ffmpeg = ` - Path to an [FFMpeg](https://www.ffmpeg.org/) binary. On most Linux distributions and on many *nix systems will be `/usr/bin/ffmpeg`. Requires FFMpeg [to be installed](https://www.ffmpeg.org/download.html). Only required to use audio functionality.  
`youtube_key = ` - [YouTube Data API v3 key](https://developers.google.com/youtube/v3/). Only required for YouTube audio streaming functionality.

### `songs.ini` Store
File must be named `songs.ini` and placed in same directory as the `bot.js` file. Required to use local audio streaming functionality.  

`audio_file[] = ` - Path to audio file. Must be an audio-only file. Video files with audio tracks will not work. Relative paths are fine.  
`audio_name[] = ` - User-friendly name of audio track.  
The file/name pair can be repeated to have multiple tracks:
```
audio_file[] = numa.mp3
audio_name[] = Numa Numa Yei by O-Zone (Romanian)
audio_file[] = kirby.mp3
audio_name[] = Gourmet Race from Kirby SuperStar
```

## Basic Usage Discord Usage
### Standard commands:
`!help` - Shows this help text.    
`!quote` - Displays funny quote-of-the-day from the [Quotes REST API](https://quotes.rest/). Add the `tts` paramter to use Discord's `/tts` feature with it.  
`!search <query>` - Display the first Google result for that query in the chat.  
`!xkcd [comic # or 'random' ]` - Fetch latest [xkcd comic](http://xkcd.com), specify number to show spcified comic, or specify random to get random comic.  
`!rick [parameter]` - Instant RickRoll. Available options include a YouTube link, text lyrics, or a GIF.  
`!s race` or `!snail race` - Starts a normal Snail Race, but the bot also joins automatically. Requires the Snail Racing bot.  
`!open the pod bay doors` - Try it.  
`!moo` - Same as [Debian Linux's `apt-get moo` command](https://unix.stackexchange.com/questions/92185/whats-the-story-behind-super-cow-powers).

### Voice commands:  
`!audio [selector]` - Plays specified audio to currently set voice channel. Use without selector to see available audio files.  
`!leave` - Stops playing audio and leaves the voice channel.  
`!switch_voice <selector>` - Change selected voice channel.  
`!list_voice` - Lists configured voice channels.  
`!set_voice <channel_id>` - Manually set voice channel ID.  
`!stream <YouTube video ID>` - Streams the audio of the video matching the provided ID.  
`!yt <keywords>` - Streams the audio of the first video result matching the specified keywords.

### Script commands:  
`!reconfig` - Reload values from the configuration file.  
`!reset` - Forces disconnect and reconnect.

### Testing commands:  
`!debug` - Dumps the last 2000 characters of log file.  
`!execption` - For tesing purposes: Throws an exception.

### Admin commands (only work if you are the owner of the bot):  
`!shutdown` - Posts a notice of going offline, dumps the last 1000 characters of the log, disconnects Discord socket, syncs filesystem, and exits NodeJS runtime.  
`!clear` - Deletes the log file.  
`!safemode` - Sets the variable to enter Safe Mode.

### Deprecated (no longer functional) commands:  
`!videos` - Used to display most recent videos from several meme channels. (Was written for my personal server, but later discontinued.)