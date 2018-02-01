const config = require('config');
const sc2 = require('./api/lib/sc2');

var api = null;

exports.init = function() {
    api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
}

exports.me = function(accessToken, callback) {
    api.setAccessToken(accessToken);
    api.me(function (err, result) {
        callback(err, result);
    });
}

exports.vote = function(accessToken,voter, author, permlink, weight, callback) {
    api.setAccessToken(accessToken);
    api.vote(voter, author, permlink, weight, function (err, result) {
        callback(err, result);
    });
}

exports.broadcast = function(accessToken, operations, callback){
    api.setAccessToken(accessToken);
    api.broadcast(operations, function(err, result){
        callback(err, result);
    });
}

exports.getLoginUrl = function(callback){
    var url = api.getLoginURL();
    callback(url)
}

exports.revokeToken = function(callback){
    api.revokeToken(function (err, res) {
        callback(err, res);
    });
}
exports.reflashToken = function(accessToken, callback){
    api.setAccessToken(accessToken);
    api.reToken(function (err, res) {
        callback(err, res);
    });
}
