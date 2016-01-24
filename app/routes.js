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

    app.get('*', function(req, res, next) {
      res.locals.user = req.user || null;
      next();
    });

    // show the home page
    app.get('/', function(req, res) {
        res.render('index');
    });

    var allBars = [];
    var businesses = [];

    app.get('/api/bars/:city', function(req, res) {

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

      function getResults(callback) {
        yelp.search({term: 'bars', location: req.params.city}, function(err, data) {
          if (err) {
            throw err;
          } else {
            callback(data);
          }
        });
      }

      getResults(function(data) {
        businesses = data.businesses;
        businesses.forEach(function(val, index, array) {
          array[index].visitorCount = 0;
          array[index].currentUser = 'Be the first to check in!';
          allBars.forEach(function(v, i, a) {
            if (val.id === v.name) {
              array[index].visitorCount = v.users.length;
               /*if (v.users.indexOf(req.user.twitter.username) > -1 || v.users.indexOf('Guest') > -1 ) {
                array[index].currentUser = 'You and ' + (v.users.length - 1) + ' other beautiful people are going!';
              } else {
                array[index].currentUser = 'You should go! ' + v.users.length + ' beautiful people are waiting for you!';
              }*/
            }
          });
        });
        res.json(businesses);
      });
    });

    app.post('/api/bars/:id', function(req, res) {

      function findBars(callback) {
        Bar.find({name: req.params.id}, function(err, docs) {
          if (err) { throw err; }
          callback(docs);
        });
      }

      function findAllBars(callback) {
        Bar.find({}, function(err, docs) {
          if (err) { throw err; }
          callback(docs);
        });
      }

      findBars(function(docs) {
        // If it's the FIRST CHECK IN EVER AT THIS BAR
        if (docs.length > 0) {
          var x = docs[0].users;
          // If current user is not checked in
          if (x.indexOf(req.user.twitter.username) === -1) {
            Bar.update({name: req.params.id}, {$push: {"users": req.user.twitter.username}}, function(err, data) {
              if (err) { throw err; }
              findAllBars(function(docs) {
                businesses.forEach(function(val, index, array) {
                  docs.forEach(function(v, i, a) {
                    if (val.id === v.name) {
                      array[index].visitorCount = v.users.length;
                      if(v.users.indexOf(req.user.twitter.username) > -1) {
                        array[index].currentUser = 'You and ' + (v.users.length - 1) + ' other beautiful people are going!';
                      } else {
                        array[index].currentUser = 'You should go! ' + v.users.length + ' beautiful people are waiting for you!';
                      }
                    }
                  });
                });
                res.json(businesses);
              });
            });
            // if current user is already checked in
          } else if (x.indexOf(req.user.twitter.username) !== -1) {
            Bar.update({name: req.params.id}, {$pull: {"users": req.user.twitter.username}}, function(err, data) {
              if (err) { throw err; }
              findAllBars(function(docs) {
                businesses.forEach(function(val, index, array) {
                  docs.forEach(function(v, i, a) {
                    if (val.id === v.name) {
                      array[index].visitorCount = v.users.length;
                      if(v.users.indexOf(req.user.twitter.username) > -1) {
                        array[index].currentUser = 'You and ' + (v.users.length - 1) + ' other beautiful people are going!';
                      } else {
                        array[index].currentUser = 'You should go! ' + v.users.length + ' beautiful people are waiting for you!';
                      }
                    }
                  });
                });
                res.json(businesses);
              });
            });
          }
        } else {
          Bar.create({
            name: req.params.id,
            users: req.user.twitter.username
          }, function(err, bar) {
            if (err) { throw err; }
            findAllBars(function(docs) {
              businesses.forEach(function(val, index, array) {
                docs.forEach(function(v, i, a) {
                  if (val.id === v.name) {
                    array[index].visitorCount = v.users.length;
                    if(v.users.indexOf(req.user.twitter.username) > -1) {
                      array[index].currentUser = 'You and ' + (v.users.length - 1) + ' other beautiful people are going!';
                    } else {
                      array[index].currentUser = 'You should go! ' + v.users.length + ' beautiful people are waiting for you!';
                    }
                  }
                });
              });
              res.json(businesses);
            });
          });
        }
      });
    });

    app.get('/test', function(req, res) {
      res.send(allBars);
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
