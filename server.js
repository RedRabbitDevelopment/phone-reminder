
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
  var response = false;
  var xml = {Response: {}};
  if(req.body.To && req.body.From && req.body.Body) {
    var incoming = mongo.log('incoming', req.body);
    var message = req.body.Body.trim();
    var match = '';
    if(message.match(/^DONE(.|!)?$/i)) {
      response = 'Thanks!';
      twilio.sendMessage(config.twilio.adminNumber, config.twilio.carawayNumber, 
        'The building security has been taken care of tonight!');
      mongo.setToday({complete: true}).done();
    } else if(message.match(/^SUBSCRIBE(.|!)?$/i)) {
      // To do: test the DB insert
      mongo.setOnDuty({phoneNumber: req.body.From}).done();
      response = 'You have subscribed to secure the church building!';
    } else if(match = message.match(/^TWILIO TEST (.*?)$/i)) {
      response = 'Thanks for testing: "' + match[1] + '".';
    } else if(message.match(/^unsubscribe/i)) {
      mongo.getOnDuty().then(function(user) {
        if(user && user.phoneNumber === req.body.From) {
          twilio.sendMessage(config.twilio.adminNumber, config.twilio.carawayNumber, 
            'Current subscriber to building security has unsubscribed. Now no one is ' +
            'subscribed. Please either notify the currently assigned person to text ' + 
            '"subscribe" to this number, or give their number to Nathan at 949-427-0061. Thanks!');
          return mongo.setOnDuty({phoneNumber: null});
        }
      }).done();
    } else {
      response = 'Forwarding your message on to Brother Caraway. Please note that ' +
        'if you are done, you should reply "Done" to this message (with no other text).';
      twilio.sendMessage(config.twilio.adminNumber, config.twilio.carawayNumber, 
        'Forwarded message from "' + req.body.From + '": "' + message + '"');
    }
    mongo.append(incoming, {response: response}).done();
    if(response) {
      xml.Response.Message = response;
    }
  }
  var builder = new xml2js.Builder();
  res.end(builder.buildObject(xml));
});

mongo.dbPromise.then(function(db) {
  app.listen(config.server.port, function() {
    console.log('listening on port ' + config.server.port);
  });
}).done();
