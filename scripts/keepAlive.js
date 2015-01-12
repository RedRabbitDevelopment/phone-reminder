 
var Starter = require('../models/cronStarter');
var config = require('../models/config');
var Promise = require('bluebird');
var request = Promise.promisify(require('request').get);

module.exports = Starter.createScript({
  name: 'Keep Server Alive',
  filename: __filename,
  process: function() {
    return request(config.server.host + '/keep-alive');
  }
});
