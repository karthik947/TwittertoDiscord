const cheerio = require('cheerio');
const E = require('events');
const request = require('request');
const separateReqPool = {maxSockets: 15};
const async = require('async');
const _ = require('lodash');
let tweets={},apiurls=[],N=[];


///////////////////////////  CONFIGURE TWITTER HANDLERS /////////////////////////////////////////////////////
var THandlers=[
    {
        name:'Karthik',
        url:"https://twitter.com/Karthikdk72?lang=en",
        webhook:"https://discordapp.com/api/webhooks/628116875481579520/V-UoVZPPnSmkWHAO99Pbn9IKSWhlMuLQlwqAKPOwwrwGCrEI2gbnwCzW05j0MChWNGWz",
        avatar_url:"https://c8.alamy.com/comp/REBBXT/manbrunettehairwighaircutraglanorangehairdresserfashionavatardummypersonimageportraithairstyleprofessionalphotocharacterprofilesetvectoriconillustrationisolatedcollectiondesignelementgraphicsignblacksimple-vector-vectors-REBBXT.jpg",
        keywords:"*",
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
                const th_name = THandlers.filter((d,i) => d.url === turl)[0].name;
                if(!tweets[turl].length){
                    //FIRST LOAD
                    const turls = $('div.js-actionable-tweet').map((i,d) => d["attribs"]["data-permalink-path"]);
                    tweets[turl] = _.difference($('div.js-tweet-text-container p').map((i,d) => {return {url:turls[i],text:$('div.js-tweet-text-container p').eq(i).text()}}));
                }
                else{
                    //EVERY OTHER TIME
                    const turls = $('div.js-actionable-tweet').map((i,d) => d["attribs"]["data-permalink-path"]);
                    const ctweets = _.difference($('div.js-tweet-text-container p').map((i,d) => {return {url:turls[i],text:$('div.js-tweet-text-container p').eq(i).text()}}));
                    const ntweets = ctweets.filter(t => !_.find(tweets[turl],t));

                    ntweets.filter(d => {
                      const th_kw = THandlers.filter((d,i) => d.url === turl)[0].keywords.split(',');
                      if(th_kw.includes('*')){
                        return true;
                      } else{
                        const checkTexts = th_kw.map(kw => d.text.includes(kw) ? true : false);
                        return checkTexts.includes(false) ? false : true;
                      }
                    }).forEach(t => {
                      const {url:content} = t;
                      sendDiscordMessage({content: `https://twitter.com${content}`,turl});
                    });
                    // tweets[turl] = tweets[turl].concat(ntweets);
                    tweets[turl] = [...tweets[turl],...ntweets];
                }

            } catch (e) {
                  console.log('Error =>' + e);
            }
        });
    }, function(err, results){
            //console.log(results);
    });
},1000);//RUNS EVERY 1 SECONDS
