const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

module.exports = twitterClient;
