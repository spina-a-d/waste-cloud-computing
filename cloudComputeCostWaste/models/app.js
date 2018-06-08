var mongoose = require('mongoose');

// User Schema
var AppSchema = mongoose.Schema({
	_creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	name: String
});

var App = module.exports = mongoose.model('App', AppSchema);

module.exports.addData = function (name, user, done)
{
	var User = mongoose.model('User');
	var Image = mongoose.model('Image');
	var Data = mongoose.model('Data');
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
	var User = mongoose.model('User');
	var Image = mongoose.model('Image');
	var Data = mongoose.model('Data');
	
	var id = mongoose.Types.ObjectId(id);
	Image.find({ _app: id }, function(err, images) {
		if(err) {
			console.log(err);
		}
		let itemsProcessed = 0;
		console.log(images);
		if(images.length == 0) {
			App.findOneAndRemove({ _id: id }, callback);
		}
		for(let i = 0; i < images.length; ++i) {
			Image.delete(images[i]._id, function(){
				++itemsProcessed;
				if(itemsProcessed == images.length) {
					console.log("Searching for id of app to delete");
					App.findOneAndRemove({ _id: id }, callback);
				}
			});
		}
	});
};