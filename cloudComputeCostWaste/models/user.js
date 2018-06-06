var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
	oauthID: Number,
	name: String,
	created: Date,
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username, callback){
	var query = {name: username};
	User.findOne(query, callback);
}

module.exports.getUserByCode = function (code, callback) {
    var query = {
        oauthID: code
    };
    User.findOne(query, callback);
}

module.exports.checkExists = function(username, email, callback){
	var query = {name: username};
	User.findOne(query, callback);
}

module.exports.updateUser = function(username, update, callback){
	var query = {name: username};
	User.findOneAndUpdate(query, update, false, callback);
}

module.exports.getDataByImage = function (code, callback) {
    var query = {
        "data.imageID": code
    };
    User.find(query, callback);
}

module.exports.getDataByApp = function (code, callback) {
    var query = {
        "data.applicationID": code
    };
    User.find(query, callback);
}

module.exports.getDataByUUID = function (code, callback) {
    var query = {
        "data.uuid": code
    };
    User.find(query, callback);
}