var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('../models/user');
const checkAuthentication = require('../utilities/auth');


/* GET home page. */
router.get('/', checkAuthentication, function(req, res, next) {
	displayData('image_token', req, res);
});

function displayData(code, req, res) {
    User.getDataByImage(code, function (err, data) {
        if (!data) {
            res.redirect('/');
        } else if (err) {
            res.redirect('/');
        } else {
            res.render('data', {
                renderPackage: data
            });
        }
    });
}

module.exports = router;
