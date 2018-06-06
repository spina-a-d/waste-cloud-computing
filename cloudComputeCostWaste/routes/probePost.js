var express = require('express');
var router = express.Router();
var Data = require('../models/data');

/* Post probe data */
router.post('/', function(req, res, next) {
	console.log("post");
	Data.addData(req, res, function (err, data) {
        if (!data) {
            res.send("FAIL\n")
        } else if (err) {
            res.send("FAIL\n");
        } else {
        	res.send("ACK\n")
        }
    });
});

module.exports = router;