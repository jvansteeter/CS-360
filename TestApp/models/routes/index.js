var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/#/_=_', function (req, res) 
{
  console.log("So Yeah I'm totally in index.js");
  res.end("Hello world");
});

module.exports = router;
