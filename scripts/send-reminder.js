
var Promise = require('bluebird');
var twilio = require('../utils/twilio');
var Starter = require('../utils/cronStarter');
var config = require('../config');
var mongo = require('../utils/mongo');
var days = require('../utils/days');

var SendReminderScript = module.exports = Starter.createScript({
  name: 'Send Reminder Script',
  filename: __filename,
  process: function(type) {
    var _this = this;
    this.today = days.today();
    return mongo.dbPromise.then(function() {
      return Promise.all([
        mongo.getToday(),
        mongo.getOnDuty()
      ]).spread(function(day, user) {
        if(user && (!day || !day.complete)) {
          var message, to, from;
          var promises = [];
          if(!day || !day.sentReminder) {
            promises.push(_this.sendReminder(user));
          }
          if(!day || !day.sentExtraReminder) {
            promises.push(_this.sendExtraReminder(user));
          }
          if(!day || !day.sentTextCaraway) {
            promises.push(_this.textCaraway());
          }
          return Promise.all(promises);
        };
      });
    });
  },
  sendReminder: function(user) {
    var message, to, from;
    var time = days.time();
    if(time > 21) {
      message = 'Just a reminder to lock up the church tonight! ' +
        'When done, reply "Done" to this message. Any other reply to ' +
        'this message will be forwarded on to Brother Caraway. Or you can ' +
        'text him directly at ' + config.twilio.carawayNumber + '.';
      to = user.phoneNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, message),
        this.setAsSent('sentReminder')
      ]);
    }
  },
  sendExtraReminder: function(user) {
    var message, to, from;
    var time = days.time();
    if(time > 21.5) {
      message = 'Please don\'t forget to reply "Done" after you\'ve locked ' +
        'up, otherwise you can expect a call from Brother Caraway.';
      to = user.phoneNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, message),
        this.setAsSent('sentExtraReminder')
      ]);
    }
  },
  textCaraway: function() {
    var message, to, from;
    var time = days.time();
    if(time > 22) {
      message = 'It looks like no one closed up at the church today. Sorry.';
      to = config.twilio.carawayNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, message),
        this.setAsSent('sentTextCaraway')
      ]);
    }
  },
  setAsSent: function(name) {
    var object = {};
    object[name] = true;
    return mongo.setToday(object);
  }
});
