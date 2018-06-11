var mongoose = require('mongoose');

// User Schema
var ProviderSchema = mongoose.Schema({
	service: String
});

var Provider = module.exports = mongoose.model('Provider', ProviderSchema);

module.exports.createOrUpdateProvider = function (service, callback){
	if(typeof service === undefined) {
		console.log("No service name provided");
		callback(null);
	}
	Provider.findOne({ service: service }, function(err, provider) {
		console.log("Found " + provider + " For service " + service);
	    if (!err) {
	        // If the document doesn't exist
	        if (provider == null) {
	            // Create it
	            provider = new Provider();
	            provider.service = service;
	            console.log("Created" + provider);
	            provider.save(function(error) {
		            if (!error) {
		                callback(provider);
		            } else {
		                throw error;
		            }
		        });
		    }
		    else {
		    	callback(provider);
		    }
	    }
	});
}