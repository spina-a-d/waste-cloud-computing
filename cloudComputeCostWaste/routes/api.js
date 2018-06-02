var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
	console.log(req.body);
	res.send("ACK\n");
});

module.exports = router;
