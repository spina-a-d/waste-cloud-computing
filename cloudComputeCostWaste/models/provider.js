var mongoose = require('mongoose');

// User Schema
var ProviderSchema = mongoose.Schema({
	name: String
});

var Provder = module.exports = mongoose.model('Provider', ProviderSchema);