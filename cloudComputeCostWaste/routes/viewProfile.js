var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('../models/user');
var App = require('../models/app');
var Image = require('../models/image');
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
		.exec(function(err, applications) {
        if (err) {
            res.redirect('/');
        } else {
        	appPackage = [];
        	for(var i = 0; i < applications.length; ++i) {
        		var promise = queryImages(req);
        		promise.then(function(images){
        			console.log(applications[i]._id);
        			appPackage.push({
        				_id: applications[i]._id,
        				name: applications[i].name,
        				images: images
        			});
				}).catch(function(error){
				   console.log(error);
				});
        	}
	    	renderPackage = {
	    		name: req.user.name,
	    		oauthID: req.user.oauthID,
	    		applications: appPackage
	    	}
	        res.render('profile', {
	            renderPackage: renderPackage
	        });
        }
    });
}

function queryImages(req){
	var promise = Image.find({_creator: req.body.id}).exec();
	return promise;
}

module.exports = router;