
var Promise = require('bluebird');
var twilio = require('../utils/twilio');
var Starter = require('../utils/cronStarter');
var config = require('../config');

var SendReminderScript = module.exports = Starter.createScript({
  name: 'Send Reminder Script',
  filename: __filename,
  process: function(type) {
    var message, to, from;
    switch(type) {
      case 'Reminder':
        message = 'Just a reminder to lock up the church tonight! ' +
          'When done, reply "Done" to this message. Any other reply to ' +
          'this message will be forwarded on to Brother Caraway. Or you can ' +
          'text him directly at ' + config.twilio.CarawayNumber + '.';
        reminderNumber = config.twilio.reminderNumber;
        break;
      case 'ExtraReminder':
        message = 'Please don\'t forget to reply "Done" after you\'ve locked ' +
          'up, otherwise you can expect a call from Brother Caraway.';
        reminderNumber = config.twilio.reminderNumber;
        break;
      case 'TextCaraway':
        message = 'It looks like no one closed up at the church today. Sorry.';
        to = config.twilio.CarawayNumber;
        break;
      default:
        throw new Error('Must include a type!');
    };
    from = config.twilio.adminNumber;
    return twilio.sendMessage(from, to, part);
  }
});
