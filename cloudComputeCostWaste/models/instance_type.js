var mongoose = require('mongoose');

// image_type Schema
var Instance_TypeSchema = mongoose.Schema({
	_provider: {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'},
	type: String,
	os: String,
	billing_unit: Number,
	price_hour: Number
});

var Instance_Type = module.exports = mongoose.model('Instance_Type', Instance_TypeSchema);

module.exports.findInstance = function (provider, type, os, callback)
{
	if(typeof provider === undefined ||
		typeof type === undefined ||
		typeof os === undefined) {
		callback(null);
	}
	var id = mongoose.Types.ObjectId(provider);
	Instance_Type.findOne({ _provider: provider, type: type, os: os }, callback);
};