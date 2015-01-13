
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
          switch(type) {
            case 'sendReminder':
              message = 'Just a reminder to lock up the church tonight! ' +
                'When done, reply "Done" to this message. Any other reply to ' +
                'this message will be forwarded on to Brother Caraway. Or you can ' +
                'text him directly at ' + config.twilio.carawayNumber + '.';
              to = user.phoneNumber;
              break;
            case 'sendExtraReminder':
              message = 'Please don\'t forget to reply "Done" after you\'ve locked ' +
                'up, otherwise you can expect a call from Brother Caraway.';
              to = user.phoneNumber;
              break;
            case 'textCaraway':
              message = 'It looks like no one closed up at the church today. Sorry.';
              to = config.twilio.carawayNumber;
              break;
            default:
              throw new Error('Unknown type "' + type + '".');
          }
          from = config.twilio.adminNumber;
          return twilio.sendMessage(from, to, message);
        };
      });
    });
  }
});
