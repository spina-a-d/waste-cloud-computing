var mongoose = require('mongoose');

// image_type Schema
var Instance_TypeSchema = mongoose.Schema({
	_provider: {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'},
	type: String,
	locale: String,
	billing_unit: Number,
	price_hour: Number
});

var Instance_Type = module.exports = mongoose.model('Instance_Type', Instance_TypeSchema);

module.exports.findInstance = function (id, callback)
{
	var id = mongoose.Types.ObjectId(id);
	Instance_Type.findOne({ _id: id }, callback);
};

module.exports.createOrUpdateInstance = function (id, type, locale, amount, callback){
	if(typeof id === undefined ||
		typeof type === undefined ||
		typeof locale === undefined) {
		console.log("Inputs invalid");
		callback(null);
	}
	id = mongoose.Types.ObjectId(id)

	Instance_Type.findOne({ _provider: id, type: type, locale: locale }, function(err, instance) {
	    if (!err) {
	        // If the document doesn't exist
	        if (instance == null) {
	        	console.log("not found instance");
	            // Create it
	            instance = new Instance_Type();
	            instance._provider = id;
	            instance.type = type;
	            instance.locale = locale;
	            instance.price_hour = amount;
	            instance.save(function(error) {
		            if (!error) {
		                callback(instance);
		            } else {
		                console.log(error);
		            }
		        });
		    }
		    else {
		    	console.log("found instance");
		    	callback(instance);
		    }
	    }
	    else{
	    	console.log(err);
	    }
	});
}