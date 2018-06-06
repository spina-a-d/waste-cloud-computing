var mongoose = require('mongoose');
var  App = mongoose.model('App') 

// User Schema
var ImageSchema = mongoose.Schema({
	application: {type: mongoose.Schema.Types.ObjectId, ref: 'App'},
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
				app: appRef,
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