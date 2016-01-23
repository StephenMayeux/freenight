var Yelp = require('yelp');
var config = require('../config/auth');
var Bar = require('./models/bar');

// Stored in cofig/auth.js, which has been added to .gitignore
var yelp = new Yelp({
  consumer_key: config.yelpAuth.consumer_key,
  consumer_secret: config.yelpAuth.consumer_secret,
  token: config.yelpAuth.token,
  token_secret: config.yelpAuth.token_secret
});

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page
    app.get('/', function(req, res) {
        res.render('index');
    });

    var allBars;
    var businesses;
    app.get('/api/update', function(req, res) {
      console.log(allBars);
      res.send('butts');
    });

    app.get('/api/bars/:city', function(req, res) {

      function getResults(callback) {
        yelp.search({term: 'bars', location: req.params.city}, function(err, data) {
          if (err) {
            throw err;
          } else {
            callback(data);
          }
        });
      }

      function getAllBars(callback) {
        Bar.find({}, function(err, docs) {
          if (err) {
            throw err;
          } else {
            callback(docs);
          }
        });
      }


      getAllBars(function(docs) {
        allBars = docs;
      });

      getResults(function(data) {
        businesses = data.businesses;
        businesses.forEach(function(val, index, array) {
          array[index].visitorCount = 0;
          allBars.forEach(function(v, i, a) {
            if (val.id === v.name) {
              array[index].visitorCount = v.users.length;
            }
          });
        });
        res.json(businesses);
      });
    });

    app.post('/api/bars/:id', function(req, res) {

      Bar.find({name: req.params.id}, function(err, docs) {
        if (err) {throw err;}
        if (docs.length !== 0) {
          var x = docs[0].users;
          if (x.indexOf('Steve') === -1) {
            Bar.update({name: req.params.id}, {$push: {"users": 'Steve' || req.user.twitter.username}}, function(err, data) {
              if (err) {throw err;}
              res.send('You have checked in');
            });
          } else if (x.indexOf('Steve') > -1) {
              Bar.update({name: req.params.id}, {$pull: {"users": 'Steve' || req.user.twitter.username}}, function(err, data) {
                if (err) {throw err;}
                res.send('You have checked out');
              });
          }
        } else {
          Bar.create({
            name: req.params.id,
            users: 'Steve' || req.user.twitter.username
          }, function(err, bar) {
            if (err) {
              res.send(err);
            } else {
              Bar.find(function(err, data) {
                if (err) {
                  res.send(err);
                } else {
                  res.send(data);
                }
              });
            }
          });
        }
      });
    });

    app.get('/test', isLoggedIn, function(req, res) {
      res.send('This is a restricted page!!');
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
