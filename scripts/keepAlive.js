 
var Starter = require('../utils/cronStarter');
var config = require('../config');
var Promise = require('bluebird');
var request = Promise.promisify(require('request').get);

module.exports = Starter.createScript({
  name: 'Keep Server Alive',
  filename: __filename,
  process: function() {
    return request(config.URL + '/keep-alive');
  }
});
