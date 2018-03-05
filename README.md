# HAL9000 Discord Bot
#### Bundled build

## What is this?

So this is essentially the same piece of software as [the master branch](https://github.com/geoffreycs/hal9000-bot/tree/master), but with one key difference: All the NPM modules that the bot depends on is bundled using [Webpack](https://webpack.js.org/) into the main `bot.js` file. So when following the installation process, you skip the `npm install` step. I mean, you could run it, but it wouldn't do anything besides make a lot of noise.

## Why two builds then?

While this version seems much simpler, and it is, and better, it does have a few downsides.
* Each module can't be updated independently. So if a new version of the Winston logger is release, you can't update it without redownloading the entire bundled release.
* The installation can't take advantage of any already-installed global NPM modules you may have on your system. 
* While it appears to execute faster, the initial loading time is higher, so there are no real speed benefits.
* Debugging and any modification of the code in the bundled release is next to impossible.

## Download

You can download as a zip archive from GitHub: <https://github.com/geoffreycs/hal9000-bot/archive/bundled.zip>. Aside from skipping the `npm install` step in installation, usage is exactly the same.

## [Return to main page](https://github.com/geoffreycs/hal9000-bot/tree/master)