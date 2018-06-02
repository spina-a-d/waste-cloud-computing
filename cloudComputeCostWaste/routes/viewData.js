var express = require('express');
var path = require('path');
var router = express.Router();
const checkAuthentication = require('../utilities/auth');

/* GET home page. */
router.get('/', checkAuthentication, function(req, res, next) {
	console.log("isAuthenticated? ", req.isAuthenticated());
	console.log(req.user);
    res.render('index');
});
module.exports = router;
