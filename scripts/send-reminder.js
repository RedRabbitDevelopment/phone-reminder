
var Promise = require('bluebird');
var twilio = require('../utils/twilio');
var Starter = require('../utils/cronStarter');
var config = require('../config');
var mongo = require('../utils/mongo');

var SendReminderScript = module.exports = Starter.createScript({
  name: 'Send Reminder Script',
  filename: __filename,
  process: function(type) {
    return mongo.getCollection('days').then(function(collection) {
      return collection.findOneAsync({
        day: today
      }).then(function(day) {
        if(!day.complete) {
          var message, to, from;
          switch(type) {
            case 'Reminder':
              message = 'Just a reminder to lock up the church tonight! ' +
                'When done, reply "Done" to this message. Any other reply to ' +
                'this message will be forwarded on to Brother Carraway. Or you can ' +
                'text him directly at ' + config.twilio.carrawayNumber + '.';
              reminderNumber = config.twilio.reminderNumber;
              break;
            case 'ExtraReminder':
              message = 'Please don\'t forget to reply "Done" after you\'ve locked ' +
                'up, otherwise you can expect a call from Brother Carraway.';
              reminderNumber = config.twilio.reminderNumber;
              break;
            case 'TextCarraway':
              message = 'It looks like no one closed up at the church today. Sorry.';
              to = config.twilio.carrawayNumber;
              break;
            default:
              throw new Error('Must include a type!');
          };
          from = config.twilio.adminNumber;
          return twilio.sendMessage(from, to, part);
        });
      });
    });
  }
});
