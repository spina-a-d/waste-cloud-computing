var mongoose = require('mongoose');

// User Schema
var ImageSchema = mongoose.Schema({
	_creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	_app: {type: mongoose.Schema.Types.ObjectId, ref: 'App'},
	name: String
});

var Image = module.exports = mongoose.model('Image', ImageSchema);

module.exports.getImagesByUser = function (code, callback)
{
	var App = mongoose.model('App');
	var User = mongoose.model('User');
	var Data = mongoose.model('Data');
	var id = mongoose.Types.ObjectId(code);
	console.log("Searching for images by user");
	Image.find({ _creator: code }, callback);
};

module.exports.addData = function (name, app, user, done)
{
	var App = mongoose.model('App');
	var User = mongoose.model('User');

	var id = mongoose.Types.ObjectId(user);
	var id = mongoose.Types.ObjectId(app);
	User.findOne({ _id: user }, function(err, userRef) {
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (userRef == null) {
	        console.log("User wasn't found");
	    } else {
	    	App.findOne({ _id: app }, function(err, appRef) {
			    if(err) {
			        console.log(err);  // handle errors!
			    }
			    if (appRef == null) {
			        console.log("User wasn't found");
			    } else {
			        var image = new Image({
						_creator: userRef._id,
						_app: appRef,
						name: name
					});
			        image.save(function(err) {
			            if(err) {
			                console.log(err);  // handle errors!
			            } else {
			               console.log("saving image ...");
			               done(null, image);
			            }
			        });
			    }
			});
	    }
	});
};

module.exports.delete = function (id, callback)
{
	var User = mongoose.model('User');
	var Data = mongoose.model('Data')

	var id = mongoose.Types.ObjectId(id);
	console.log("Searching for id of image to delete");
	Data.deleteFromImage( id , function() {
		Image.findOneAndRemove({ _id: id }, callback);
	});
};