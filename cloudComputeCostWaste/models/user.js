var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
	oauthID: Number,
	name: String,
	created: Date
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username, callback){
	var query = {githubId: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.checkExists = function(username, email, callback){
	var query = {github: username};
	User.findOne(query, callback);
}

module.exports.updateUser = function(username, update, callback){
	var query = {githubId: username};
	User.findOneAndUpdate(query, update, false, callback);
}