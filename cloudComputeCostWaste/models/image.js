var mongoose = require('mongoose');
var App = mongoose.model('App') 
var User = mongoose.model('User') 

// User Schema
var ImageSchema = mongoose.Schema({
	_creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	_app: {type: mongoose.Schema.Types.ObjectId, ref: 'App'},
	name: String
});

var Image = module.exports = mongoose.model('Image', ImageSchema);

module.exports.addData = function (req, callback)
{
	App.findOne({ _id: req.body.applicationID }, function(err, appRef) {
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (imageRef == null) {
	        console.log("App wasn't found");
	    } else {
	        var image = new Image({
				_creator: appRef,
				name: req.body.name
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
};

module.exports.getImagesByUser = function (code, callback)
{
	var id = mongoose.Types.ObjectId(code);
	console.log("Searching for images by user");
	Image.find({ _creator: code }, callback);
};