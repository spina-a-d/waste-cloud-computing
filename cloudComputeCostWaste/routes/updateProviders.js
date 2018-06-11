var express = require('express');
var path = require('path');
var router = express.Router();
var fs = require('fs');
var Provider = require('../models/provider');
var Instance_Type = require('../models/instance_type');

/* Update providers then redirect to homepage */
router.get('/', function(req, res, next) {
	var itemsProcessed = 1;
	var fileList = ["aws.json", "azure.json", "gcp.json"];
	console.log("Updating Providers");
	console.log(fileList.length);
	for(let i = 0; i < fileList.length; ++i) {
		processFile('./providers/' + fileList[i], function() {
			++itemsProcessed;
	  		if(itemsProcessed == fileList.length) {
		  		res.redirect('/');
		  	}
		});
	}
});
module.exports = router;

function processFile(file, callback) {
	var input;
	fs.readFile(file, 'utf8', function (err, data) {
		console.log("Updating");
	  	if (err) console.log(err);
	  	input = JSON.parse(data);
	  	input = input.data[0];
	  	Provider.createOrUpdateProvider(input.service, function(provider){
	  		if(err) {
	  			console.log(err);
	  			res.redirect('/');
	  		}
	  		else {
	  			//need this to keep track of how many items are done before callback
	  			//can probably be done more efficiently
	  			let totalItems = 0;
	  			let vmList = Object.getOwnPropertyNames(input.data.services);
	  			for(let j = 0; j < vmList.length; ++j) {
	  				if(Object.keys(input.data.services[vmList[j]]).length === 0 && 
	  				input.data.services[vmList[j]].constructor === Object) { 
	  					continue;//check for empty object and ignore
	  				}
	  				let localesList = Object.getOwnPropertyNames(input.data.services[vmList[j]].locales);
	  				for(let k = 0; k < localesList.length; ++k) {
	  					++totalItems;
	  				}
	  			}
	  			console.log(totalItems);
	  			let itemsProcessed = 0;
	  			for(let j = 0; j < vmList.length; ++j) {
	  				if(Object.keys(input.data.services[vmList[j]]).length === 0 && 
	  				input.data.services[vmList[j]].constructor === Object) { 
	  					continue;//check for empty object and ignore
	  				}
	  				let localesList = Object.getOwnPropertyNames(input.data.services[vmList[j]].locales);
	  				let itemsAdded = 0;
	  				for(let k = 0; k < localesList.length; ++k) {
	  					//console.log(provider.service + " " + vmList[j] + " " + localesList[k] + " " + input.data.services[vmList[j]].locales[localesList[k]]);
	  					Instance_Type.createOrUpdateInstance(provider._id, 
	  						vmList[j], localesList[k], 
	  						input.data.services[vmList[j]].locales[localesList[k]], 
	  						function(instance){
	  							++itemsProcessed;
	  							if(itemsProcessed == totalItems)
	  								console.log("finished with " + provider.service);
			    					callback();
	  					});
	  				}
	  			}
	  		}
	  	});	
	});
}

/*
Object.keys(input).map(function(objectKey, index) {
	var value = input[objectKey];
});
for(let j = 0; j < value.services; ++j) {
	for(let k = 0; k < value.services[i].locales.length; ++k) {
		console.log(value.services[i] + value.services[i].locales[k]);
	}
}
*/