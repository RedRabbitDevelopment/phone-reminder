var configParser, _;

_ = require('lodash');

module.exports = configParser = function(mapper, owner, data, depth) {
  var envKey, key, newDepth, val;
  if (depth == null) {
    depth = [];
  }
  for (key in mapper) {
    val = mapper[key];
    newDepth = depth.concat(key.replace(/[^a-zA-Z0-9]/g, ''));
    owner[key] = _.isObject(val) ? (owner[key] || (owner[key] = {}), configParser(val, owner[key], data, newDepth)) : (envKey = newDepth.join('_').toUpperCase(), data[envKey] || owner[key]);
    if (owner[key] == null) {
      throw new Error("Unable to find config variable " + (newDepth.join('.')));
    }
  }
  return owner;
};
