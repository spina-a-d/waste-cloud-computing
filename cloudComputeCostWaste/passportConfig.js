var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var User = require('./models/user.js');
var config = require('./utilities/oauth.js');

module.exports = function(app) {
    //passport setup
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport init
    passport.use(new GithubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL },
        function(accessToken, refreshToken, profile, done) {
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

    // test authentication
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        console.log("Not Authenticated", req.user);
        res.redirect('/');
    }

    app.get('/testAuth', ensureAuthenticated, function(req, res){
        User.findById(req.session.passport.user, function(err, user) {
            if(err) {
                console.log(err);  // handle errors
            } else {
                res.redirect('/viewData');
            }
        });
    });

    //auth pages
    app.get('/auth/github',
        passport.authenticate('github'),
        function(req, res){});
    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/testAuth');
        });

    // serialize and deserialize for session
    passport.serializeUser(function(user, done) {
        console.log('serializeUser: ' + user);
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            console.log('deserializeUser: ' + user);
            if(!err) done(null, user);
            else done(err, null);
        });
    });
}