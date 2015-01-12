
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
    return mongo.getCollection('days').then(function(collection) {
      return collection.findOneAsync({
        day: _this.today
      }).then(function(day) {
        if(!day || !day.complete) {
          var message, to, from;
          var promises = [];
          if(!day || !day.sentReminder) {
            promises.push(_this.sendReminder());
          }
          if(!day || !day.sentExtraReminder) {
            promises.push(_this.sendExtraReminder());
          }
          if(!day || !day.sentTextCarraway) {
            promises.push(_this.textCarraway());
          }
          return Promise.all(promises);
        });
      });
    });
  },
  sendReminder: function() {
    var message, to, from;
    var time = days.time();
    if(time > 21) {
      message = 'Just a reminder to lock up the church tonight! ' +
        'When done, reply "Done" to this message. Any other reply to ' +
        'this message will be forwarded on to Brother Carraway. Or you can ' +
        'text him directly at ' + config.twilio.carrawayNumber + '.';
      reminderNumber = config.twilio.reminderNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, part),
        this.setAsSent('sentReminder')
      ]);
    }
  },
  sendExtraReminder: function() {
    var message, to, from;
    if(time > 21.5) {
      message = 'Please don\'t forget to reply "Done" after you\'ve locked ' +
        'up, otherwise you can expect a call from Brother Carraway.';
      reminderNumber = config.twilio.reminderNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, part),
        this.setAsSent('sentExtraReminder')
      ]);
    }
  },
  textCarraway: function() {
    if(time > 22) {
      var message, to, from;
      message = 'It looks like no one closed up at the church today. Sorry.';
      to = config.twilio.carrawayNumber;
      from = config.twilio.adminNumber;
      return Promise.all([
        twilio.sendMessage(from, to, part),
        this.setAsSent('sentTextCarraway')
      ]);
    }
  },
  setAsSent: function(name) {
    var object = {};
    object[name] = true;
    return mongo.getCollection('days').then(function(days) {
      return days.updateAsync({
        day: _this.today
      }, {
        $set: object
      });
    });
  }
});
