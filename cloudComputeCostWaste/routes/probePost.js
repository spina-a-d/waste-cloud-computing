var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* Post probe data */
router.post('/', function(req, res, next) {
	User.addData(req, function (err, user) {
        if (!user) {
            res.send("FAIL\n")
        } else if (err) {
            res.send("FAIL\n");
        } else {
        	res.send("ACK\n")
        }
    });
});

module.exports = router;