var express = require('express');
var path = require('path');
var router = express.Router();


function checkAuthentication(req, res, next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/auth/github");
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("isAuthenticated? ", req.isAuthenticated());
	console.log(req.user);
    res.render('index');
});
module.exports = router;
