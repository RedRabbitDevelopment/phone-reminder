
var _ = require('lodash');
var Promise = require('bluebird');
var twilio = require('../config').twilio;
var Twilio = module.exports = require('twilio')(twilio.sid, twilio.token);

Twilio.sendMessage = function(from, to, message) {
  return Promise.all(message.match(/.{1,160}/g).map(function(part) {
    return Twilio.sms.messages.create({
      body: part,
      to: to,
      from: from
    });
  }));
};
