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
    
    let itemsProcessed = 0;
    let dataPackage = [];
    let threshold = 20;

    for(let i = 0; i < images.length; ++i) {
    	console.log("searching for data for images: " + images[i]._id);
        Data.getDataByImage(images[i]._id, function(err, data) {
            if (err) {
                console.log(err);
                res.redirect('/');
            }
            let uuidList = [];
            let dataProcessed = 0;

            console.log("About to process data");
            //sorting the data into uuid buckets
            if(data.length == 0) {
            	//CASE :: NO DATA FOR IMAGE
            	dataPackage.push({
                    imageName: images[i].name,
                    uuidList: []
                });
                ++itemsProcessed;
                if(itemsProcessed == images.length){
                    console.log("Rendering!");
                    res.render('data', {
                        dataPackage: dataPackage
                    });
                }
            }
            for(let j = 0; j < data.length; ++j) {
                //store unique uuids for an image.
                //if data on the instance was provided by the probe user we can add cost calculations
                //this doesn't need to be called every time, but I can't get it synchronized without doing so.
                //Big performance gains if fixed
        		Instance_Type.findInstance(data[j]._instance_type, function(err, instance){
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
                            locale: null,
                            billing_unit: null,
                            price_hour: null,
                            data: [data[j]]
                        });
                        console.log("pushed a uuid");
                        if(instance != null) {
                            uuidList[uuidList.length - 1].provider = instance._provider;
                            uuidList[uuidList.length - 1].type = instance.type;
                            uuidList[uuidList.length - 1].locale = instance.locale;
                            if(instance.billing_unit != null)
                                uuidList[uuidList.length - 1].billing_unit = instance.billing_unit;
                            else { //billing unit not defined use resolution of 1 second
                                uuidList[uuidList.length - 1].billing_unit = 3600;
                            }
                            uuidList[uuidList.length - 1].price_hour = instance.price_hour;
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
                            console.log(itemsProcessed);
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
    let multipleResponseTime = 10; //for resolution of instance death
    //now check which uuids are alive
    for(let i = 0; i < uuidList.length; ++i) {
        let responseTime = 0;
        let currentWindowSize = 1;

        //needs to be sorted by time so window can be shifted along
        uuidList[i].data.sort(compareTimes);

        for(let j = 1; j < uuidList[i].data.length; ++j) {
            ++currentWindowSize;
            //check average response time
            avgResponseTime = Math.ceil(responseTime / currentWindowSize);
            if(responseTime != 0 && //dead in this window reset
                uuidList[i].data[j].time - uuidList[i].data[j - 1].time > multipleResponseTime * avgResponseTime) {
                if(uuidList[i].billing_unit != null && 
                    uuidList[i].price_hour != null) {
                    let billed_time = Math.ceil(responseTime / uuidList[i].billing_unit);
                    uuidList[i].cost += billed_time * uuidList[i].price_hour;
                    uuidList[i].btu_waste += (billed_time - (responseTime / uuidList[i].billing_unit)) * uuidList[i].price_hour;
                }
                responseTime = 0;
                currentWindowSize = 0;
            } 
            else { //not dead, add times and continue
                responseTime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;  
                uuidList[i].uptime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
                if(uuidList[i].data[j].cpu < threshold) {
                    uuidList[i].idletime += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
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
        if(uuidList[i].alive === false &&
        	uuidList[i].billing_unit != null && 
            uuidList[i].price_hour != null) {
        	console.log("adding to cost");
            let billed_time = Math.ceil(responseTime / uuidList[i].billing_unit);
            uuidList[i].cost += billed_time * uuidList[i].price_hour;
            uuidList[i].btu_waste += (billed_time - (responseTime / uuidList[i].billing_unit)) * uuidList[i].price_hour;
        }
    }
    callback();
}

module.exports = router;
