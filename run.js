const cheerio = require('cheerio');
const E = require('events');
const request = require('request');
const separateReqPool = {maxSockets: 15};
const async = require('async');
let tweets={},apiurls=[],N=[];


///////////////////////////  CONFIGURE TWITTER HANDLERS /////////////////////////////////////////////////////
var THandlers=[
    {
        name:'WhaleWatch',
        url:"https://twitter.com/whalewatchio?lang=en",
        webhook:"https://discordapp.com/api/webhooks/623550424896503828/2pHcXVLnP4l5IlM0cLULbm6WvhWGWZNHL7P9b1qMdOj7CyfiXWmzCaoxxWIm_PZUKtR1",
        avatar_url:"https://www.sideshow.com/storage/product-images/903429/thanos_marvel_feature.jpg",
        keywords:"long",
    },
    {
        name:'Karthik',
        url:"https://twitter.com/Karthikdk72?lang=en",
        webhook:"https://discordapp.com/api/webhooks/628116875481579520/V-UoVZPPnSmkWHAO99Pbn9IKSWhlMuLQlwqAKPOwwrwGCrEI2gbnwCzW05j0MChWNGWz",
        avatar_url:"https://pbs.twimg.com/profile_images/1072041449200398336/UKuZcIiO_400x400.jpg",
        keywords:"BTC",
    }
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ADD TWEETS
THandlers.forEach((th,i) => {
    tweets[th.url] = [];
    apiurls.push(th.url);
});

//DISCORD WEBHOOK
const sendDiscordMessage = (pl) => {
    const {content,turl} = pl;
    const {name,webhook,avatar_url} = THandlers.filter((d,i) => d.url === turl)[0];
    request.post(webhook).form({username:name,avatar_url:avatar_url,content:content});
}

console.log('Twitter => Discord program is running');

//MONITOR
setInterval(() => {
    async.map(apiurls, function(item, callback){
        request({url: item, pool: separateReqPool}, function (error, response, body) {
            try {
                const $ = cheerio.load(body);
                var turl = "https://twitter.com" + response.req.path;
                if(!tweets[turl].length){
                    //FIRST LOAD
                    for(let i=0;i<$('div.js-tweet-text-container p').length;i++){
                        tweets[turl].push($('div.js-tweet-text-container p').eq(i).text());
                    }
                }
                else{
                    //EVERY OTHER TIME
                    for(let i=0;i<$('div.js-tweet-text-container p').length;i++){
                        const s_tweet = $('div.js-tweet-text-container p').eq(i).text();
                        //CHECK IF TWEET IS NEWS
                        if(tweets[turl].indexOf(s_tweet) === -1){
                            tweets[turl].push(s_tweet);
                            const th_kw = THandlers.filter((d,i) => d.url === turl)[0].keywords.split(',');
                            const th_name = THandlers.filter((d,i) => d.url === turl)[0].name;
                            let nFlag=false;
                            th_kw.forEach((kw,j) => {
                                if(kw === '*'){
                                    nFlag=true;
                                }
                                else{
                                   if(s_tweet.indexOf(kw) != -1){
                                        nFlag=true;
                                    }
                                }
                            });
                            if(nFlag){
                               sendDiscordMessage({content:s_tweet,turl:turl});
                            }
                        }
                    }
                }

            } catch (e) {
                  console.log('Error =>' + e);
            }
        });
    }, function(err, results){
            //console.log(results);
    });
},1000);//RUNS EVERY 1 SECONDS
