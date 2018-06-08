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
    let multipleResponseTime = 2;

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
                        uptime: 0,
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
                let currentWindowSize = 0;
                let upTime = 0;
                for(let j = 0; j < uuidList[i].data.length; ++j) {
                    ++currentWindowSize;
                    //check average response time
                    if(j != 0){
                        avgResponseTime = Math.round(responseTime / currentWindowSize);
                        if(responseTime != 0 &&
                            uuidList[i].data[j].time - uuidList[i].data[j - 1].time > multipleResponseTime * avgResponseTime) {
                            responseTime = 0;
                            currentWindowSize = 0;
                        } else {
                            responseTime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;  
                            upTime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
                        } 
                    }

                }
                avgResponseTime = Math.round(responseTime / currentWindowSize);
                if( uuidList[i].data[uuidList[i].data.length - 1] != null) {
                    //check that the last ping was not more than 2 times the average response time for the current window
                    // ago or its likely dead unless we find otherwise
                    console.log(Math.round((new Date()).getTime() / 1000));
                    console.log(data[data.length - 1].time);
                    console.log(2 * avgResponseTime);
                    if(Math.round((new Date()).getTime() / 1000) - data[data.length - 1].time > multipleResponseTime * avgResponseTime){
                        uuidList[i].alive = false;
                    }
                }
                else {
                    uuidList[i].alive = false;
                }
                uuidList[i].uptime = upTime;
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
