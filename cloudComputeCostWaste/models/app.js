var mongoose = require('mongoose');
var User = mongoose.model('User') 

// User Schema
var AppSchema = mongoose.Schema({
	_creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	name: String
});

var App = module.exports = mongoose.model('App', AppSchema);

module.exports.addData = function (req, res, done)
{
	User.findOne({ _id: req.user._id }, function(err, userRef) {
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (userRef == null) {
	        console.log("User wasn't found");
	    } else {
	        var app = new App({
				_creator: userRef._id,
				name: req.body.name
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