// what i had for my post request

app.post('/api/bars/:id', function(req, res) {

  Bar.find({name: req.params.id}, function(err, docs) {
    if (err) {throw err;}
    // If anyone has previously checked in, then it exists in Bar
    if (docs.length !== 0) {
      var x = docs[0].users;
      // If currently logged in user hasn't checked in, add to users list
      if (x.indexOf('Steve') === -1) {

        Bar.update({name: req.params.id}, {$push: {"users": 'Steve' || req.user.twitter.username}}, function(err, data) {
          if (err) {throw err;}

        });

        // If currently logged in user has already checked in, then remove from list
      } else if (x.indexOf('Steve') > -1) {
          Bar.update({name: req.params.id}, {$pull: {"users": 'Steve' || req.user.twitter.username}}, function(err, data) {
            if (err) {throw err;}
          });
      }
      // If no users have ever checked in, then create and add to Bar
    } else {
      Bar.create({
        name: req.params.id,
        users: 'Steve' || req.user.twitter.username
      }, function(err, bar) {
        if (err) { throw err; }
      });
    }
  });
  res.send('need a response');
});
