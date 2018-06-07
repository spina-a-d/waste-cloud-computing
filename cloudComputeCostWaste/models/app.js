var mongoose = require('mongoose');
var User = mongoose.model('User') 

// User Schema
var AppSchema = mongoose.Schema({
	_creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	name: String
});

var App = module.exports = mongoose.model('App', AppSchema);

module.exports.addData = function (name, user, done)
{
	User.findOne({ _id: user }, function(err, userRef) {
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (userRef == null) {
	        console.log("User wasn't found");
	    } else {
	        var app = new App({
				_creator: userRef._id,
				name: name
			});
	        app.save(function(err) {
	            if(err) {
	                console.log(err);  // handle errors!
	            } else {
	               console.log("saving app ...");
	               done(null, app);
	            }
	        });
	    }
	});
}

module.exports.delete = function (id, callback)
{
	var id = mongoose.Types.ObjectId(id);
	console.log("Searching for id of app to delete");
	App.findOneAndRemove({ _id: id }, callback);
};