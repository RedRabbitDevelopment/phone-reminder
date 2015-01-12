
var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');
Promise.promisifyAll(MongoClient);
var config = require('../config').mongo;
var uri = 'mongodb://';
if(config.username && config.password) {
  uri += config.username + ':' + config.password + '@';
}
uri += config.host + '/' + config.db;

module.exports = {
  dbPromise: MongoClient.connectAsync(uri),
  getCollection: function(name) {
    return this.dbPromise().then(function(db) {
      var collection = db.collection(name);
      Promise.promisifyAll(collection);
      return collection;
    });
  }
};
