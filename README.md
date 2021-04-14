# Twitter to Discord using Webhooks

This is a new version of "TweetMonitor" tool that I shared few weeks ago. In this new program, the tweets are posted onto a discord server instead of desktop notifications.

### Version3 Changes

<span style="color: #FFDC00;"> This version of the bot posts link to the tweet instead of text. This version is added due to multiple requests from subscribers. </span>

### Version5 Changes

<span style="color: #FFDC00;"> Twitter webpage is updated again, which required to update the code. The new version posts only tweet text, as I couldn't find the tweet link by scraping. Also, the website is now rendered on the client side, so the old way of calling the webpage with User Agent flag is rendered obsolete. Puppeteer is used to overcome this issue, which works as a headless browser control api. Make sure to run "npm install" to install dependencies, after downloading the version5</span>

### Key Updates

- Instead of desktop notifications, tweets are send to discord server.
- Monitoring frequency is 1 sec. Feel free to customize it in the setInterval function of the code.
- Latency is around 2-3 secs.
- No need of access keys as this is implemented using web-scraping technique.

### Contributions

Thank you for your contribution.

- BTC Address: 1BwSbBvx98bqSEHFETnLqEBC7dZqf4yLv4
- MEW Address: 0xFC5479343d791eca8EEBB01C488e0a5F460f0453

click [here](https://youtu.be/Rlx8LjHo9Jc) to watch the youtube video.
