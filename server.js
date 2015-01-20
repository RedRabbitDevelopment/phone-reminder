
var express = require('express');
var bodyParser = require('body-parser');
var xml2js = require('xml2js');
var app = express();
var mongo = require('./utils/mongo');
var days = require('./utils/days');

var twilio = require('./utils/twilio');
var config = require('./config');

app.get('/keep-alive', function(req, res) {
  console.log('keeping alive...');
  res.json({success: true});
});

app.post('/message', bodyParser.urlencoded({extended: true}), function(req, res) {
  res.set('Content-Type', 'text/xml');
  var response = '';
  var xml = {Response: {}};
  if(req.body.To && req.body.From && req.body.Body) {
    var incoming = mongo.log('incoming', req.body);
    if(req.body.Body.trim().match(/DONE(.|!)?/i)) {
      response = 'Thanks!';
      twilio.sendMessage(config.twilio.adminNumber, config.twilio.carawayNumber, 
        'The building security has been taken care of tonight!');
      mongo.setToday({complete: true}).done();
    } else if(req.body.Body.trim().match(/SUBSCRIBE(.|!)?/i)) {
      // To do: test the DB insert
      mongo.setOnDuty({phoneNumber: req.body.From}).done();
      response = 'You have subscribed to secure the church building!';
    } else {
      response = 'Forwarding your message on to Brother Caraway. Please note that ' +
        'if you are done, you should reply "Done" to this message (with no other text).';
      twilio.sendMessage(config.twilio.adminNumber, config.twilio.carawayNumber, 
        'Forwarded message from "' + req.body.From + '": "' + req.body.Body + '"');
    }
    mongo.append(incoming, {response: response}).done();
    xml.Response.Message = response;
  }
  var builder = new xml2js.Builder();
  res.end(builder.buildObject(xml));
});

mongo.dbPromise.then(function(db) {
  app.listen(config.server.port, function() {
    console.log('listening on port ' + config.server.port);
  });
}).done();
