var express = require('express');
var path = require('path');
var fs = require('fs');
var stream = require('stream');
var router = express.Router();

var User = require('../models/user');
var Image = require('../models/image');
var App = require('../models/app');
var Instance_Type = require('../models/instance_type');
var Provider = require('../models/provider');

const checkAuthentication = require('../utilities/auth');
//this is a cheaty way of doing probe generation 'cause I'm low on time
/* GET profile page. */
router.get('/', checkAuthentication, function(req, res, next) {
    Instance_Type.find({}, function (err, combinations) {
        if (!combinations) {
            res.redirect('/');
        } else if (err) {
            res.redirect('/');
        } else {
            sortData(combinations, function(sortedData){
		    	res.render('createImage', {
					data: sortedData,
					queryData: req.query
				});
		    });
        }
    });
});

function sortData(combinations, callback){
	let data = [];
	Provider.find({}, function(err, providers){
		for(let i = 0; i < providers.length; ++i) {
    		data.push({
    			service: providers[i].service,
    			provider: providers[i]._id,
    			locales: []
    		});
    	}
		for(let i = 0; i < combinations.length; ++i) {
    		let pos = data.map(function(e) { 
    			return String(e.provider); 
    		}).indexOf(String(combinations[i]._provider));
            if(pos < 0){
	    		console.log("Error, provider not found.");
	    	}
	    	else {
	    		let locale = data[pos].locales.map(function(e) { return String(e.location); }).indexOf(String(combinations[i].locale));
	    		if(locale < 0) {
	    			data[pos].locales.push({
	    				location: combinations[i].locale,
	    				types: []
	    			});
	    			locale = data[pos].locales.map(function(e) { return String(e.location); }).indexOf(String(combinations[i].locale));
	    		}
	    		data[pos].locales[locale].types.push({
	    			type: combinations[i].type,
	    			id: combinations[i]._id
	    		});
	    	}
    	}
	    callback(data);
	});
}

router.post('/', checkAuthentication, function(req, res, next) {
	console.log(req.body);
	fs.readFile("../probe/probeStart.sh", "utf8", function(err, start) {
		Instance_Type.find({_id: req.body.instance_choice }, function(err, instance){
			let config = (
						"USER_ID=" + req.user._id + '\n' + 
						"IMAGE_TOKEN=" + req.query.image + '\n' + 
						"DESTINATION=" + "localhost:3000" + '\n' +  //replace with final ip
						"PORT=" + req.body.port + '\n' + 
						"PING_RATE=" + req.body.ping + '\n' + 
						"INSTANCE_TYPE=" + instance[0]._id + '\n'
					);
			start = start + '\n\n' + config;
			fs.readFile("../probe/probeEnd.sh", "utf8", function(err, end) {
				start = start + '\n' + end;
				res.setHeader('Content-type', "application/octet-stream");
				res.setHeader('Content-disposition', 'attachment; filename=probe.sh');
				res.send(start);
			});
		});
	});
});

module.exports = router;