// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'twitterAuth' : {
        'consumerKey'        : 'wQR0NQAvhwGwA7hXgiJ4gJWZj',
        'consumerSecret'     : '9rDEODx6uoJ6BCNexqQq7P1ww3jkcpnu4STetJNS4Pzlqhvdpt',
        'callbackURL'        : 'http://127.0.0.1:8080/auth/twitter/callback'
    },

    'yelpAuth': {
        'consumer_key': 'BpWlZJyHd_7ZDQJp5iyipA',
        'consumer_secret': 'mNEekUE0wgU6L7o_znIzmPSuThk',
        'token': 'XBKssYxRxGHQfOw3kWoK_H9-BTqHwE96',
        'token_secret': '4N3pkn7T0U87wD992ACX73E-GY8'
    }

};
