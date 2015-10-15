var config, configParser, e, ignore, m, mUrl, m_regex, required_config, _, _ref;

required_config = require('./config.example.json');

_ = require('lodash');

config = (function() {
  try {
    return require('./_config.json');
  } catch (_error) {
    e = _error;
    return {};
  }
})();

if (mUrl = process.env.MONGOLAB_URI) {
  m_regex = /^mongodb:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*?)$/;
  config.mongo = m = {};
  _ref = mUrl.match(m_regex), ignore = _ref[0], m.username = _ref[1], m.password = _ref[2], m.host = _ref[3], m.port = _ref[4], m.db = _ref[5];
}

if (process.env.PORT) {
  config.server || (config.server = {});
  config.server.port = process.env.PORT;
}

if (process.env.NODE_ENV) {
  config.server || (config.server = {});
  config.server.environment = process.env.NODE_ENV;
}

if (process.env.BUILD_ENV) {
  config.server || (config.server = {});
  config.server.environment = process.env.BUILD_ENV;
}

configParser = require('./config-parser');

module.exports = configParser(required_config, config, process.env);
