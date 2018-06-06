var mongoose = require('mongoose');
var Image = mongoose.model('Image') 

// User Schema
var DataSchema = mongoose.Schema({
	image: {type: mongoose.Schema.Types.ObjectId, ref: 'Image'},
	uuid: String, 
	cpu: Number, 
	mem: Number, 
	disk: Number
});

var Data = module.exports = mongoose.model('Data', DataSchema);

module.exports.addData = function (req, callback)
{
	Image.findOne({ _id: req.body.imageID }, function(err, imageRef) {
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (imageRef == null) {
	        console.log("Image wasn't found");
	    } else {
	        var data = new Data({
				image: imageRef,
				uuid: req.body.uuid, 
				cpu: req.body.cpu, 
				mem: req.body.mem, 
				disk: req.body.disk
			});
	        data.save(function(err) {
	            if(err) {
	                console.log(err);  // handle errors!
	            } else {
	               console.log("saving data ...");
	               done(null, data);
	            }
	        });
	    }
	});
};