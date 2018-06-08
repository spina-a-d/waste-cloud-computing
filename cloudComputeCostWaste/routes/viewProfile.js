var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('../models/user');
var Image = require('../models/image');
var App = require('../models/app');


const checkAuthentication = require('../utilities/auth');

/* GET profile page. */
router.get('/', checkAuthentication, function(req, res, next) {
	displayProfile(req, res);
});

/* Add App Post */
router.post('/', function(req, res, next) {
	let action_path = String(req.body.action).split(".");
	console.log(action_path);
	switch(action_path[0]) {
	    case "app":
	        switch(action_path[1]) {
			    case "create":
			        console.log("creating " + req.body.name_app);
			        //create application with name_app
			        App.addData(req.body.name_app, req.user._id, function (err) {
						if (err) {
				            console.log(err);
				        } else {
				        	res.redirect('/viewProfile');
				        }
			        });
			        break;
			    case "delete":
			        console.log("deleting " + action_path[2]);
			        App.delete(action_path[2], function (err) {
						if (err) {
				            console.log(err);
				        } else {
				        	res.redirect('/viewProfile');
				        }
			        });
			        break;
			    default:
			    	console.log("Error: action_path invalid");
			        break
			}
	        break;
	    case "image":
	        switch(action_path[1]) {
			    case "create":
			    	let id = "name" + action_path[2];
			        console.log("creating " + req.body[id]);
			       	Image.addData(req.body[id], action_path[2], req.user._id, function (err) {
						if (err) {
				            console.log(err);
				        } else {
				        	res.redirect('/viewProfile');
				        }
			        });
			        break;
			    case "delete":
			        console.log("deleting " + action_path[2]);
			        Image.delete(action_path[2], function (err) {
						if (err) {
				            console.log(err);
				        } else {
				        	res.redirect('/viewProfile');
				        }
			        });
			        break;
			    default:
			    	console.log("Error: action_path invalid");
			        break;
			}
	        break;
	    default:
	    	console.log("Error: action_path invalid");
	        break;
	} 
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
function queryImages(app){
	var promise = Image.find({_app: app._id}).exec();
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
	if(applications.length == 0) {
		console.log("No applications, returning");
		callback(req, appPackage);
	}
	for(let i = 0; i < applications.length; ++i) {
		createPacket(queryImages(applications[i]), applications[i], function(package) {
			console.log("packet pushed");
			appPackage.push(package);
			++itemsProcessed;
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
		callback(package);
	}).catch(function(error){
	    console.log(error);
	});
}
module.exports = router;