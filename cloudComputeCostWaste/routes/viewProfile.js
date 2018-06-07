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
        	console.log("creating package");
        	var rendPackage = null;
        	createPackage(req, applications, rendPackage, function(){
        		console.log("rendering");
        		res.render('profile', {
	            	renderPackage: rendPackage
	       		});
        	})
        }
    });
}

//ensures images are queried synchronously
function queryImages(req){
	var promise = Image.find({_creator: req.body.id}).exec();
	return promise;
}

//ensures package is created synchronously
function createPackage(req, applications, rendPackage, callback){
	appPackage = [];
	console.log("looping over apps");
	loopPackets(req, applications, appPackage, function(){
		console.log("appPackage created");
		rendPackage = {
			name: req.user.name,
			oauthID: req.user.oauthID,
			applications: appPackage
		}
	});
}

function loopPackets(req, applications, callback){
	for(var i = 0; i < applications.length; ++i) {
		var package = null;
		createPacket(queryImages(req), applications[i], package, function() {
			console.log("packet pushed");
			appPackage.push(package);
		});	
	}
}

//ensures packet is created synchronously
function createPacket(promise, app, package, callback){
	promise.then(function(images){
		package = {
			_id: app._id,
			name: app.name,
			images: images
		};
		console.log("package " + package + " created");
	}).catch(function(error){
		package = {
			_id: "error",
			name: "error",
			images: ["error"]
		};
	    console.log(error);
	});
}
module.exports = router;