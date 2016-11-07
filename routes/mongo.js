var express = require('express');
var router = express.Router();
var mongoURL = 'http://localhost:28017/meteor';
var request = require('request');

router.get('/*', function(req, res, next) {
  var targetURL = mongoURL+req.url+"/";

  console.log("mongo proxy: "+targetURL);

  request(targetURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body); // Print the body of response.
      res.send(body);
    }
  });

});

module.exports = router;
