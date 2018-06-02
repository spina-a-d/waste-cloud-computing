var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var passport = require('passport');
//var GithubStrategy = require('passport-github').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

var User = require('./models/user.js');
var config = require('./oauth.js');

var uri = 'mongodb+srv://root:test@cluster0-jmmfm.mongodb.net/test?retryWrites=true';
mongoose.connect(uri);

var db = mongoose.connection;
var app = express();

//routes
var index = require('./routes/index');
var api = require('./routes/api');
var registerApp = require('./routes/registerApp');
var viewData = require('./routes/viewData');
var downloadProbe = require('./routes/downloadProbe');
var probePost = require('./routes/probePost');

app.use('/', index);
app.use('/api', api);
app.use('/registerApp', registerApp);
app.use('/viewData', viewData);
app.use('/downloadProbe', downloadProbe);
app.use('/probePost', probePost);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: true
}));
//pasport setup
/*
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
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
