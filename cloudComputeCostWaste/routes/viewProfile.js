var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('../models/user');
var App = require('../models/app');
const checkAuthentication = require('../utilities/auth');

/* GET profile page. */
router.get('/', checkAuthentication, function(req, res, next) {
	displayProfile(req, res);
});

/* Add App Post */
router.post('/', function(req, res, next) {
	App.addData(req, res, function (err) {
		if (err) {
            console.log(err);
        } else {
        	res.redirect('/viewProfile');
        }
    });
	
});

/*Displays the profile of the user with code 'code',
  or a redirect if code does not exist */
function displayProfile(req, res) {
    App.find({_creator: req.user._id})
		.populate('_id')
		.exec(function(err, applications) {
        if (!applications) {
            res.redirect('/');
        } else if (err) {
            res.redirect('/');
        } else {
        	console.log(applications);
        	renderPackage = {
        		name: req.user.name,
        		oauthID: req.user.oauthID,
        		applications: applications
        	}
            res.render('profile', {
                renderPackage: renderPackage
            });
        }
    });
}

module.exports = router;