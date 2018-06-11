var express = require('express');
var path = require('path');
var router = express.Router();

var Image = require('../models/image');
var Data = require('../models/data');
var Instance_Type = require('../models/instance_type');
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
    let threshold = 20;

    for(let i = 0; i < images.length; ++i) {
        Data.getDataByImage(images[i]._id, function(err, data) {
            if (err) {
                console.log(err);
                res.redirect('/');
            }
            let uuidList = [];
            let dataProcessed = 0;
            console.log("About to process data");
            //sorting the data into uuid buckets
            for(let j = 0; j < data.length; ++j) {
                //store unique uuids for an image.
                //if data on the instance was provided by the probe user we can add cost calculations
                //this doesn't need to be called every time, but I can't get it synchronized without doing so.
                //Big performance gains if fixed
        		Instance_Type.findInstance(data[j]._provider, data[j].instance_type, data[j].os, function(err, instance){
                    if(err) {
                        console.log(err);
                        res.redirect('/');
                    }
                    let pos = uuidList.map(function(e) { return e.uuid; }).indexOf(data[j].uuid);
                    if(pos < 0){   
                        uuidList.push({
                            uuid: data[j].uuid,
                            alive: true,
                            uptime: 0,
                            idletime: 0,
                            billed_time: 0,
                            cost: 0,
                            btu_waste: 0,
                            provider: null,
                            type: null,
                            os: null,
                            billing_unit: null,
                            price_hour: null,
                            data: [data[j]]
                        });
                        console.log("pushed a uuid");
                        if(instance != null) {
                            uuidList[i].provider = instance.provider;
                            uuidList[i].type = instance.type;
                            uuidList[i].os = instance.os;
                            uuidList[i].billing_unit = instance.billing_unit;
                            uuidList[i].price_hour = instance.price_hour;
                            console.log("Added instance info");
                        }
                    }
                    else {
                        uuidList[pos].data.push(data[j]);
                    }
                    ++dataProcessed;
                    if(dataProcessed == data.length) {
                        processBuckets(uuidList, threshold, function(){
                            console.log("Bucket finished");
                            dataPackage.push({
                                imageName: images[i].name,
                                uuidList: uuidList 
                            });
                            ++itemsProcessed;
                            if(itemsProcessed == images.length){
                                console.log("Rendering!");
                                res.render('data', {
                                    dataPackage: dataPackage
                                });
                            }
                        });
                    }
            	});
            }
        });
    }
}

function compareTimes(a, b) {
	if (a.time < b.time)
    	return -1;
  	if (a.time > b.time)
    	return 1;
  	return 0;
}

function processBuckets(uuidList, threshold, callback) {
    console.log("moving to bucket processing");
    let multipleResponseTime = 2; //for resolution of instance death
    //now check which uuids are alive
    for(let i = 0; i < uuidList.length; ++i) {
        let responseTime = 0;
        let currentWindowSize = 0;

        //needs to be sorted by time so window can be shifted along
        uuidList[i].data.sort(compareTimes);

        for(let j = 0; j < uuidList[i].data.length; ++j) {
            ++currentWindowSize;
            //check average response time
            if(j != 0){
                avgResponseTime = Math.round(responseTime / currentWindowSize);
                if(responseTime != 0 && //dead in this window reset
                    uuidList[i].data[j].time - uuidList[i].data[j - 1].time > multipleResponseTime * avgResponseTime) {
                    responseTime = 0;
                    currentWindowSize = 0;
                    if(uuidList[i].billing_unit != null && 
                        uuidList[i].price_hour != null) {
                        cost += (uuidList[i].uptime / billing_unit) * price_hour + (uuidList[i].uptime % billing_unit > 0 ? 1 : 0) * price_hour;
                        btu_waste += (uuidList[i].uptime % billing_unit > 0 ? 1 : 0) * price_hour;
                    }
                } 
                else { //not dead, add times and continue
                    responseTime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;  
                    uuidList[i].uptime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
                    if(uuidList[i].data[j].cpu < threshold) {
                        uuidList[i].idletime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
                    }
                } 
            }
        }
        avgResponseTime = Math.round(responseTime / currentWindowSize);
        if( uuidList[i].data.length > 0) {
            //check that the last ping was not more than 2 times the average response time for the current window
            // ago or its likely dead unless we find otherwise
            if(Math.round((new Date()).getTime() / 1000) - uuidList[i].data[uuidList[i].data.length - 1].time > multipleResponseTime * avgResponseTime){
                uuidList[i].alive = false;
            }
        }
        else {
            uuidList[i].alive = false;
        }
    }
    callback();
}

module.exports = router;
