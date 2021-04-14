const log = console.log;
const { default: got } = require('got/dist/source');
const puppeteer = require('puppeteer');
const FormData = require('form-data');
let tweets = {};

///////////////////////////  CONFIGURE TWITTER HANDLERS /////////////////////////////////////////////////////
const THandlers = [
  {
    name: 'Karthik',
    url: 'https://twitter.com/Karthik82167867?lang=en',
    webhook:
      'https://discord.com/api/webhooks/735186145373323396/y8R6roeeucC-t_7o6AnguLY_htky68HrFXzHO1aowDm-Ggw2qvnnSQcCJS2hVDCBpsvA',
    avatar_url:
      'https://c8.alamy.com/comp/REBBXT/manbrunettehairwighaircutraglanorangehairdresserfashionavatardummypersonimageportraithairstyleprofessionalphotocharacterprofilesetvectoriconillustrationisolatedcollectiondesignelementgraphicsignblacksimple-vector-vectors-REBBXT.jpg',
    keywords: '*',
  },
  //     {
  //         name:'Fat Kid Deals',
  //         url:"https://twitter.com/Tainguynpdx?lang=en",
  //         // webhook:"https://discordapp.com/api/webhooks/717922216473395247/lVi2i8zL_AeCdhthzS8y4XLSh_QlwOS1zevupfQogO-Q6JGPS5mJ_jtF9OoMbLTFyzvi",
  //         webhook:"https://discordapp.com/api/webhooks/628116875481579520/V-UoVZPPnSmkWHAO99Pbn9IKSWhlMuLQlwqAKPOwwrwGCrEI2gbnwCzW05j0MChWNGWz",
  //         avatar_url:"https://www.sideshow.com/storage/product-images/903429/thanos_marvel_feature.jpg",
  //         keywords:"*",
  //
  //     }
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getTweets = async ({ name, url, webhook, avatar_url, keywords }) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });
    await page.waitForTimeout(3000);

    const cTweets = await page.evaluate(() => {
      return [...document.querySelectorAll("article[role='article']")].map(
        (r) => r.innerText
      );
    });
    await browser.close();
    if (!tweets[url]) {
      //FIRST LOAD
      tweets[url] = [...cTweets];
    } else {
      //EVERY OTHER TIME
      const slicelen = cTweets
        .map((d) => {
          return tweets[url].indexOf(d);
        })
        .indexOf(0);
      const ntweets = slicelen === -1 ? [] : cTweets.slice(0, slicelen);
      tweets[url] = [...cTweets];
      await Promise.all(
        ntweets
          .filter((tweet) =>
            keywords === '*'
              ? true
              : keywords.map((kw) => tweet.includes(kw)).filter((k) => k).length
          )
          .map((tweetText) =>
            sendDiscordMessage({
              tweetText,
              webhook,
              avatar_url,
              keywords,
              name,
            })
          )
      );
      ntweets.forEach(log);
    }
  } catch (err) {
    log(err);
  }
};

const app = async () => {
  try {
    return await Promise.all(THandlers.map(getTweets));
  } catch (err) {
    log(err);
  }
};

//DISCORD WEBHOOK
const sendDiscordMessage = async ({ tweetText, webhook, avatar_url, name }) => {
  try {
    let form = new FormData();
    form.append('username', name);
    form.append('avatar_url', avatar_url);
    form.append('content', tweetText.split('\n').slice(-1)[0]);
    return await got.post(webhook, {
      body: form,
    });
  } catch (err) {
    return log(err);
  }
};

console.log('Twitter => Discord program is running');

setInterval(app, 10 * 1000);
