var mongoose = require('mongoose');


// User Schema
var DataSchema = mongoose.Schema({
	_image: {type: mongoose.Schema.Types.ObjectId, ref: 'Image'},
	uuid: String, 
	cpu: Number, 
	mem: Number, 
	disk: Number,
	time: Number
});

var Data = module.exports = mongoose.model('Data', DataSchema);


module.exports.addData = function (req, res, done)
{

	var Image = mongoose.model('Image');
	var id = mongoose.Types.ObjectId(req.body.image);
	Image.findOne({ _id: id }, function(err, imageRef) {
		console.log("received");
	    if(err) {
	        console.log(err);  // handle errors!
	    }
	    if (imageRef == null) {
	        console.log("Image wasn't found");
	    } else {
	        var data = new Data({
				_image: imageRef,
				uuid: req.body.uuid, 
				cpu: req.body.cpu, 
				mem: req.body.mem, 
				disk: req.body.disk,
				time: req.body.time
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

module.exports.getDataByImage = function (code, callback)
{
	var Image = mongoose.model('Image');

	var id = mongoose.Types.ObjectId(code);
	console.log("Searching for images by user");
	Data.find({ _image: id }, callback);
};

module.exports.deleteFromImage = function (id, callback)
{
	var Image = mongoose.model('Image');

	var id = mongoose.Types.ObjectId(id);
	console.log("Searching for id of data to delete");
	Data.find({ _image: id }, function(err, datas){
		if(err) console.log(err);
		else{
			console.log(datas);
			let itemsProcessed = 0;
			if(datas.length == 0) {
				callback();
			}
			for(let i = 0; i < datas.length; ++i) {
				Data.findOneAndRemove({ _id: datas[i]._id }, function(){
					++itemsProcessed;
					if(itemsProcessed == datas.length) {
						callback();
					}
				});
			}
		}
	});
};