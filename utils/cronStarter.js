/* 
 * This model is in charge of starting and stopping scripts. To use
 * it, require the file:
 *
 *    var Starter = require('../models/cronStarter');
 *    Starter.runWithCommand(__filename, scriptFn);
 *
 * If this file is called directly from the command line, then Starter
 * will run:
 *
 *    scriptFn(<args>);
 *
 * This is useful if you want to require the file and also use it as a
 * script.
 *
 * Example: I have a small script that takes two integers and
 * outputs the sum of them:
 *
 *    var Additionator, sum,
 *      Starter = require('../models/cronStarter');
 *
 *    Additionator = function(a, b) {
 *      a = parseInt(a);
 *      b = parseInt(b);
 *      console.log('Summing ' + a + ' + ' + b + '.');
 *      var result = sum(a, b);
 *      console.log('Result: ' + result);
 *    };
 *    module.exports = sum = function(a, b) {
 *      return a + b;
 *    };
 *
 *    Starter.runWithCommand(__filename, Additionator);
 *
 *  Now I can either run this script from the command line:
 *
 *    node scripts/addionator.js 5 20
 *    -- Summing 5 + 20.
 *    -- Result: 25
 *
 *  Or I can use it from other scripts (really helpful for testing):
 *
 *    var Additionator = require('./addionator');
 *    var sum = Additionator(5, 9); // 14
 *
 *  Starter will even wait for any services to be ready and handle
 *  any errors that are thrown and exit gracefully. Just be sure to
 *  return a promise if your script is asyncronous.
 */
var Promise = require('bluebird');
// var services = require('./services');
var _ = require('lodash');
var uuid = require('uuid');

function Logger() {
  this.messages = [];
}
Logger.prototype.log = function() {
  var args = [].slice.call(arguments, 0);
  args = _.flatten(args, true);
  this.messages = this.messages.concat(args);
};

var Starter = module.exports = {
  createScript: function(options) {
    var Script = this.buildScript(options);
    var ranThisFile = process.argv[1] === options.filename;
    var notMocha = process.argv[0] !== 'mocha';
    if(ranThisFile && notMocha) {
      var email = process.env.EMAIL;
      return this.runScript(Script, process.argv.slice(2), {email: email});
    }
    return Script;
  },
  buildScript: function(options) {
    var Script = function(noLog) {
      this.logger = Starter.createLogger(noLog);
      this.scriptId = uuid.v4();
      if(this.construct)
        this.construct();
    };
    Script.prototype = options;
    Script.prototype.log = function() {
      var args = [].slice.call(arguments, 0);
      this.logger.log.apply(this.logger, args);
    };
    return Script;
  },
  createLogger: function(noLog) {
    if(noLog) {
      return new Logger();
    } else {
      return console;
    }
  },
  runScript: function(Script, args, options) {
    options = options || {};
    var _this = this;
    var script = new Script(options.noLog || options.email);
    script.args = args;
    return Promise.try(function() {
      //return services.open();
    }).then(function() {
      return script.process.apply(script, args);
    }).then(function(result) {
      script.logger.log('Exited Successfully');
    }, function(e) {
      script.logger.log('Processing Error: ', e, e.stack);
      return 1;
    }).then(function(errorCode) {
      script.errorCode = errorCode;
      if(options.email && errorCode) {
        return _this.emailResults(script, options.email);
      }
    }).catch(function(e) {
      console.log('Email error: ', e, e.stack);
    }).then(function() {
      if(!options.skipExit) {
        process.exit(script.errorCode);
      }
      return script;
    });
  },
  emailResults: function(script, email) {
    var messages = script.logger.messages.map(function(message) {
      return JSON.stringify(message);
    });
    /*
    return smtp.sendEmail({
      to: email,
      subject: 'CronJob Results',
      template: 'cronresults',
      data: {
        name: script.name,
        args: script.args,
        messages: messages
      }
    });
    */
  },
  testScript: function(script, args, options) {
    var defaults = {
      skipExit: true,
      noLog: true
    };
    options = _.extend({}, defaults, options);
    args = args || [];
    return Starter.runScript(Starter.buildScript(script), args, options);
  }
};

