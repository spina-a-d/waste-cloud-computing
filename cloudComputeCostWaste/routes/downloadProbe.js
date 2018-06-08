var express = require('express');
var path = require('path');
const fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.download('testCurl.sh');
});
module.exports = router;
