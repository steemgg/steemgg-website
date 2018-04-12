require('babel-core/register')({
      ignore: /node_modules\/(?!ProjectB)/
});

let assert = require('assert');
let redis = require('../api/lib/redis');
let user = require('../api/models/user');
let mockHttp = require('./mockHttp');
let testAccount = 'yh';
let testToken = 'pass';

redis.Initialize({
    url: "127.0.0.1",
    port: 6379
});

describe('Api', function() {
    var server;

    before(function() {
        server = mockHttp.server.create();
        server.start();
    });

    after(function() {
        server.stop();
    });

    describe("GET /v1/me", function() {
        it('returns 401', function() {
            mockHttp.client.get('/v1/me', function(err, req, res, data) {
                assert.equal(res.statusCode, 401);
            });
        });
    });
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

