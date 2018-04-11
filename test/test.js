require('babel-core/register')({
      ignore: /node_modules\/(?!ProjectB)/
});

let config = require('config');
let assert = require('assert');
let redis = require('../api/lib/redis');
let user = require('../api/models/user');
let testAccount = 'yh';
let testToken = 'pass';

redis.Initialize({
    url: config.get('steemit.redis.host'),
    port: config.get('steemit.redis.port')
});

describe('Redis', function() {
    describe('#set token()', function() {
        it('should return OK ',async function() {
            let ret =  await user.setUserToken(testAccount, testToken);
            assert.equal(ret, 'OK');
        });
    });
    describe('#get token()', function() {
        it('should return ' + testToken ,async function() {
            let ret =  await user.getUserToken(testAccount);
            assert.equal(ret, testToken);
        });
    });
});
