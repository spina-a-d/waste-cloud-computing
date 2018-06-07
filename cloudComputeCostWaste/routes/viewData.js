var express = require('express');
var path = require('path');
var router = express.Router();

var Image = require('../models/image');
var Data = require('../models/data');
const checkAuthentication = require('../utilities/auth');


/* GET home page. */
router.get('/', function(req, res, next) {
	displayData(req, res);
});

function displayData(req, res) {
    //normall pass req.session.user._id as code
    Image.getImagesByUser('5b1818145f2f3b51b3c5b0f4', function (err, images) {
        if (!images) {
            res.redirect('/');
        } else if (err) {
            res.redirect('/');
        } else {
            getData(res, images);
        }
    });
}

function getData(res, images){
    console.log("searching for data for images: " + images[0]._id);
    let itemsProcessed = 0;
    let dataPackage = [];

    for(let i = 0; i < images.length; ++i) {
        Data.getDataByImage(images[i]._id, function(err, data) {
            data.sort(compareTimes);
            let uuidList = [];
            ++itemsProcessed;
            
            console.log("About to process data");
            for(let j = 0; j < data.length; ++j) {
                let pos = uuidList.map(function(e) { return e.uuid; }).indexOf(data[j].uuid);
                if(pos < 0){
                    console.log("pushed a uuid");
                    uuidList.push({
                        uuid: data[j].uuid,
                        alive: true,
                        data: [data[j]]
                    }); //store unique uuids for an image.
                } 
                else {
                    uuidList[pos].data.push(data[j]);
                }
                
            }
            //now sort the data into uuid buckets and also check which uuids are alive
            for(let i = 0; i < uuidList.length; ++i) {
                let responseTime = 0;
                for(let j = 0; j < uuidList[i].data.length; ++j) {
                    //check average response time
                    responseTime += uuidList[i].data[j].time;   
                }
                let avgResponseTime = responseTime / uuidList[i].data.length;
                if( uuidList[i].data[uuidList[i].data.length - 1] != null) {
                    //check that the last ping was not more than 2 times the average response time
                    // ago or its likely dead unless we find otherwise
                    if(new Date().getSeconds() - data[data.length - 1] > 2 * avgResponseTime){
                        uuidList[i].alive = false;
                    }
                }
                else {
                    uuidList[i].alive = false;
                }
            }
            
            dataPackage.push({
                imageName: images[i].name,
                uuidList: uuidList 
            });
            if(itemsProcessed == images.length){
                console.log(dataPackage);
                res.render('data', {
                    dataPackage: dataPackage
                });
            }
        });
    }
}

function compareTimes(a , b) {
  if (a.time < b.time)
    return -1;
  if (a.time > b.time)
    return 1;
  return 0;
}

module.exports = router;
