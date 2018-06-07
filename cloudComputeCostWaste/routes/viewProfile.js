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
        	[];
        	createPackage(req, applications, function(rendPackage){
        		console.log(rendPackage);
        		res.render('profile', {
	            	renderPackage: rendPackage
	       		});
        	})
        }
    });
}

//ensures images are queried synchronously
function queryImages(req){
	var promise = Image.find({_app: req.body.id}).exec();
	return promise;
}

//ensures package is created synchronously
function createPackage(req, applications, callback){
	console.log("looping over apps");
	loopPackets(req, applications, function(req, appPackage){
		console.log("appPackage created");
		let rendPackage = {
			name: req.user.name,
			oauthID: req.user.oauthID,
			applications: appPackage
		}
		callback(rendPackage);
	});
}

function loopPackets(req, applications, callback){
	let itemsProcessed = 0;
	let appPackage = [];
	for(let i = 0; i < applications.length; ++i) {
		createPacket(queryImages(req), applications[i], function(package) {
			console.log("packet pushed");
			appPackage.push(package);
			++itemsProcessed;
			console.log(itemsProcessed);
			if(itemsProcessed == applications.length){
				console.log("all items processed");
	            callback(req, appPackage);
	        }
		});	
	}
}

//ensures packet is created synchronously
function createPacket(promise, app, callback){
	promise.then(function(images){
		let package = {
			_id: app._id,
			name: app.name,
			images: images
		};
		console.log("package " + package + " created");
		callback(package);
	}).catch(function(error){
	    console.log(error);
	});
}
module.exports = router;