var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var User = require('./models/user.js');
var config = require('./oauth.js');

// Passport init
passport.use(new GitHubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL },
    function(accessToken, refreshToken, profile, cb) {
        User.findOne({ oauthID: profile.id }, function(err, user) {
            if(err) {
                console.log(err);  // handle errors!
            }
            if (!err && user !== null) {
                done(null, user);
            } else {
                user = new User({
                    oauthID: profile.id,
                    name: profile.displayName,
                    created: Date.now()
                });
                user.save(function(err) {
                    if(err) {
                        console.log(err);  // handle errors!
                    } else {
                       console.log("saving user ...");
                       done(null, user);
                    }
                });
            }
      });
    }
));
