var express = require('express');
var path = require('path');
var router = express.Router();

var Image = require('../models/image');
var Data = require('../models/data');
var Instance_Type = require('../models/instance_type');
const checkAuthentication = require('../utilities/auth');

var threshold = 20;
var itemsProcessed = 0;
var dataPackage = [];

/* GET home page. */
router.get('/', /*checkAuthentication,*/ function(req, res, next) {
	displayData(req, res);
});

function displayData(req, res) {
    //normall pass req.session.user._id as code
    Image.getImagesByUser(/*req.user._id*/'5b1818145f2f3b51b3c5b0f4', function (err, images) {
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
    for(let i = 0; i < images.length; ++i) {
    	console.log("searching for data for images: " + images[i]._id);
        Data.getDataByImage(images[i]._id, function(err, data) {
            if (err) {
                console.log(err);
                res.redirect('/');
            }

            console.log("About to process data");
            //sorting the data into uuid buckets
            sortData(res, data, images, i);
        });
    }
}

async function sortData(res, data, images, i) {
    let uuidList = [];
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
    //This loop will wait for each next() to pass the next iteration
    for (var j = 0; j < data.length; ++j) { 
        await new Promise(next=> {
            let pos = uuidList.map(function(e) { return e.uuid; }).indexOf(data[j].uuid);
            if(pos < 0){
                Instance_Type.findInstance(data[j]._instance_type, function(err, instance){
                    if(err) {
                        console.log(err);
                        res.redirect('/');
                    }
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
                        data: [data[j]],
                        cost_at_btu: []
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
                    if(j == data.length - 1) {
                        processBuckets(uuidList, threshold, function(){
                            console.log("Bucket finished");
                            dataPackage.push({
                                imageName: images[i].name,
                                uuidList: uuidList,
                            });
                            ++itemsProcessed;
                            if(itemsProcessed == images.length){
                                console.log("Rendering!");
                                res.render('data', {
                                    dataPackage: dataPackage
                                });
                            }
                            next();
                        });
                    }
                    next();
                });
            } else {
                uuidList[pos].data.push(data[j]);
                if(j == data.length - 1) {
                    processBuckets(uuidList, threshold, function(){
                        console.log("Bucket finished");
                        dataPackage.push({
                            imageName: images[i].name,
                            uuidList: uuidList,
                        });
                        ++itemsProcessed;
                        if(itemsProcessed == images.length){
                            console.log("Rendering!");
                            res.render('data', {
                                dataPackage: dataPackage
                            });
                        }
                        next();
                    });
                }
                next();
            }

        })       
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
    let multipleResponseTime = 5; //for resolution of instance death
    //now check which uuids are alive
    for(let i = 0; i < uuidList.length; ++i) {
        let responseTime = 0;
        let currentWindowSize = 1;
        //needs to be sorted by time so window can be shifted along
        uuidList[i].data.sort(compareTimes);
        let btu_start = uuidList[i].data[0].time;
        let btu_waste_time = 0;
        for(let j = 1; j < uuidList[i].data.length; ++j) {
            ++currentWindowSize;
            //check average response time
            avgResponseTime = Math.ceil(responseTime / currentWindowSize);
            if(responseTime != 0 && //dead in this window reset
                uuidList[i].data[j].time - uuidList[i].data[j - 1].time > multipleResponseTime * avgResponseTime) {
                if(uuidList[i].billing_unit != null && 
                    uuidList[i].price_hour != null) {
                	if((uuidList[i].data[j].time - btu_start) > uuidList[i].billing_unit) {
                		console.log("BTU ended");
                		let billed_time = 1.0; //non-magic number, add 1 btu for the closed btu
                		uuidList[i].cost += billed_time * uuidList[i].price_hour;
                        uuidList[i].cost_at_btu.push({
                            cost_at_time_point: uuidList[i].cost,
                            time: uuidList[i].data[j].time
                        });
                		uuidList[i].btu_waste += (btu_waste_time / uuidList[i].billing_unit) * uuidList[i].price_hour;
                		btu_start = uuidList[i].data[j].time;
                		btu_waste_time = 0;
                	} else {
                		btu_waste_time += uuidList[i].data[j].time - uuidList[i].data[j - 1].time;
                	}
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
        if(uuidList[i].data.length > 0) {
            //check that the last ping was not more than 2 times the average response time for the current window
            // ago or its likely dead unless we find otherwise
            if(Math.round((new Date()).getTime() / 1000) - uuidList[i].data[uuidList[i].data.length - 1].time > multipleResponseTime * avgResponseTime){
                uuidList[i].alive = false;
            }
        }
        else {
            uuidList[i].alive = false;
        }
        if(uuidList[i].billing_unit != null && 
            uuidList[i].price_hour != null) {
        	console.log("Final Cost addition");
            let billed_time = Math.ceil((uuidList[i].data[uuidList[i].data.length - 1].time - btu_start) / uuidList[i].billing_unit);
            console.log("time added " + billed_time);
            uuidList[i].cost += billed_time * uuidList[i].price_hour;
            for(let k = 0; k < billed_time; ++k) {
                uuidList[i].cost_at_btu.push({
                    cost_at_time_point: uuidList[i].cost,
                    time: btu_start + ((k + 1) * uuidList[i].billing_unit)
                });
            }
            uuidList[i].btu_waste += (billed_time - (responseTime / uuidList[i].billing_unit)) * uuidList[i].price_hour;
        }
    }
    callback();
}

module.exports = router;
