require('babel-core/register')({
      ignore: /node_modules\/(?!ProjectB)/
});
let assert = require('assert');
let config = require('config');
var db = require('../api/lib/db');
let redis = require('../api/lib/redis');
let user = require('../api/models/user');
let game = require('../api/models/game');
let mockHttp = require('./mockHttp');
let testAccount = 'yh';
let testToken = 'pass';
let testUserId = '1000';
let testGameId = '1000';

redis.Initialize({
    url: config.get('steemit.redis.host'),
    port: config.get('steemit.redis.port')
});

db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  }
});

describe('Api', function() {
    let server;

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

describe('DB', function() {
    before(async function() {
        try {
            await game.clearCache();
            await db.execute(db.WRITE, 'delete from activities where userid= ?', [testUserId]);
            await db.execute(db.WRITE, 'delete from comments where userid= ?', [testUserId]);
            await db.execute(db.WRITE, 'delete from games where id= ? and userid= ?', [testGameId,testUserId]);
        } catch (err) {
            assert.fail('test failed');
        }
    });
    after(async function() {
        try {
            await db.execute(db.WRITE, 'delete from activities where userid= ?', [testUserId]);
            await db.execute(db.WRITE, 'delete from comments where userid= ?', [testUserId]);
            await db.execute(db.WRITE, 'delete from games where id= ? and userid= ?', [testGameId,testUserId]);
        } catch (err) {
            assert.fail('test failed');
        }
    });
    describe('#add game', function() {
        it('should return 1 ',async function() {
            let unix = Math.round(+new Date()/1000);
            let gameInfo = {
                id:testGameId,
                userid:testUserId,
                account:testAccount,
                created:unix,
                lastModified:unix,
                gameUrl:'test',
                coverImage:'test',
                version:'1.0.0',
                title:'test game',
                category:'test',
                description:'test game for unit test'
            };
            try{
                let dbRes = await game.addGame(gameInfo);
                assert.equal(dbRes.affectedRows, 1);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#query game info', function() {
        it('should return game info ',async function() {
            try{
                let dbRes = await game.getGameById(testGameId);
                assert.equal(dbRes[0].id, testGameId);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#delete game', function() {
        it('should deleted',async function() {
            try{
                await game.deleteGame([testGameId,testUserId]);
                let dbRes = await game.getGameById(testGameId);
                assert.equal(dbRes[0].status, 3);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#update game', function() {
        it('should updated',async function() {
            let unix = Math.round(+new Date()/1000);
            let gameInfo = {
                lastModified:unix,
                gameUrl:'modify test',
                coverImage:'modify image',
                version:'1.0.1',
                title:'test game v2',
                category:'test',
                description:'test game for unit test'
            };
            try{
                await game.updateGame([gameInfo,testGameId,testUserId]);
                let dbRes = await game.getGameById(testGameId);
                assert.equal(dbRes[0].gameUrl, 'modify test');
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#audit game', function() {
        it('should audit',async function() {
            let unix = Math.round(+new Date()/1000);
            let audit = { userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'http',comment:'audit', type:1};
            try{
                await game.auditGame(audit,2);
                let dbRes = await game.getGameById(testGameId);
                assert.equal(dbRes[0].status, 2);
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('should has comment',async function() {
            try{
                let dbRes = await game.auditComments([testGameId]);
                assert.equal(dbRes[0].permlink, 'http');
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#report game', function() {
        it('should report',async function() {
            let unix = Math.round(+new Date()/1000);
            let report = { userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'report http', comment:'report'};
            try{
                await game.reportGame(report);
                let dbRes = await game.getGameById(testGameId);
                assert.equal(dbRes[0].report, 1);
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('should has comment',async function() {
            try{
                let dbRes = await game.reportComments([testGameId]);
                assert.equal(dbRes[0].permlink, 'report http');
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('can report',async function() {
            try{
                let dbRes = await game.canReportGame([testGameId]);
                assert.equal(dbRes.length, 1);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });
    describe('#activity', function() {
        it('should activity',async function() {
            let unix = Math.floor(new Date() / 1000) - 86400*8;
            let activity = {userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'activity'};
            try{
                await game.addActivity(activity);
                let dbRes = await game.getActivitiesById(testGameId);
                assert.equal(dbRes[0].permlink, 'activity');
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('should recently activity',async function() {
            try{
                let dbRes = await game.getRecentlyActivity(testGameId);
                assert.equal(dbRes[0].permlink, 'activity');
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('should payout activity',async function() {
            try{
                let dbRes = await game.getPayoutActivities();
                for(let k in dbRes){
                    if(dbRes[k].gameid == testGameId) {
                        assert.equal(dbRes[k].permlink, 'activity');
                    }
                }
            } catch (err) {
                assert.fail('test failed'+err);
            }
        });
        it('should add 1',async function() {
            try{
                await game.updateActivityCount([testGameId,testUserId]);
                let dbRes = await game.getGameById(testGameId);
                console.log(dbRes);
                assert.equal(dbRes[0].activities, 1);
            } catch (err) {
                assert.fail('test failed'+err);
            }
        });
    });
});

describe('Query', function() {
    before(async function() {
        await game.clearCache();
        let unix = Math.round(+new Date()/1000);
        for(let i=0; i<100; i++) {
            let gameInfo = { userid:testUserId,
                account:testAccount,
                created:unix,
                lastModified:unix,
                gameUrl:'test',
                coverImage:'test',
                version:'1.0.1',
                title:'test game',
                category:'test',
                description:'test game for unit test',
                status:Math.floor(Math.random() * Math.floor(3)),
                report:Math.floor(Math.random() * Math.floor(2))
            };
            try{
            let dbRes = await game.addGame(gameInfo);
            } catch (err) {
                assert.fail('test failed');
            }
        }
    });
    after(async function() {
        try{
            await db.execute(db.WRITE, 'delete from games where userid= ?', [testUserId]);
            await game.clearCache();
        } catch (err) {
            assert.fail('test failed');
        }
    });
    describe('#game nums', function() {
        it('should return nums ',async function() {
            let params = {};
            params['status'] = 1;
            params['report'] = 0;
            params['recommend'] = 0;
            params['account'] = '';
            params['category'] = '';
            try{
                let dbRes = await game.countOfGames(params);
                let key = 'game:count:s:'+params['status']+':r:'+params['report']+':remm:'+params['recommend']+':a:'+params['account']+':c:'+params['category'];
                let rows = await redis.instance.get(key);
                let assertRes = JSON.parse(rows);
                assert.equal(dbRes[0].nums, assertRes[0].nums);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });

    describe('#game list', function() {
        let params = {};
        params['status'] = 1;
        params['report'] = 0;
        params['recommend'] = 0;
        params['account'] = '';
        params['category'] = '';
        params['offset'] = 1;
        params['pageSize'] = 2;
        params['sort'] = 'created_desc';
        let key = 'game:list:s:'+params['status']+':r:'+params['report']+':remm:'+params['recommend']+':a:'+params['account']+':c:'+params['category']+':o:'+ params['offset']+':p:'+params['pageSize']+':s:'+params['sort'];

        it('should return games ',async function() {
            try{
                let dbRes = await game.gameList(params);
                let rows = await redis.instance.get(key);
                let assertRes = JSON.parse(rows);
                assert.equal(dbRes[0].id, assertRes[0].id);
            } catch (err) {
                assert.fail('test failed');
            }
        });
        it('should return null ',async function() {
            try{
                await game.clearCache();
                let rows = await redis.instance.get(key);
                assert.equal(rows, null);
            } catch (err) {
                assert.fail('test failed');
            }
        });
    });

    describe('#random query',async function() {
        it('should return equals ',async function() {
            let assertListKey = [];
            for(let i=0; i<300; i++) {
                let params = {};
                params['status'] = Math.floor(Math.random() * Math.floor(3));
                params['report'] = Math.floor(Math.random() * Math.floor(2));
                params['recommend'] = Math.floor(Math.random() * Math.floor(2));
                params['account'] = '';
                params['category'] = '';
                params['offset'] = Math.floor(Math.random() * Math.floor(10));
                params['pageSize'] = 2;
                params['sort'] = 'created_desc';
                let key = 'game:list:s:'+params['status']+':r:'+params['report']+':remm:'+params['recommend']+':a:'+params['account']+':c:'+params['category']+':o:'+ params['offset']+':p:'+params['pageSize']+':s:'+params['sort'];
                try{
                    let dbRes = await game.gameList(params);
                    if(assertListKey.indexOf(key)===-1 && dbRes.length>0){
                        assertListKey.push(key);
                    }
                } catch (err) {
                    assert.fail('test failed'+err);
                }
            }
            let allKey = 'game:list';
            let rows = await redis.instance.hgetall(allKey);
            assert.equal(assertListKey.length,Object.keys(rows).length);
        });
        it('should return nums equals ',async function() {
            let assertCountsListKey = [];
            for(let i=0; i<300; i++) {
                let params = {};
                params['status'] = Math.floor(Math.random() * Math.floor(3));
                params['report'] = Math.floor(Math.random() * Math.floor(2));
                params['recommend'] = Math.floor(Math.random() * Math.floor(2));
                params['account'] = '';
                params['category'] = '';
                params['offset'] = Math.floor(Math.random() * Math.floor(10));
                params['pageSize'] = 2;
                params['sort'] = 'created_desc';
                let countKey = 'game:count:s:'+params['status']+':r:'+params['report']+':remm:'+params['recommend']+':a:'+params['account']+':c:'+params['category'];
                try{
                    let dbRes = await game.countOfGames(params);
                    if(assertCountsListKey.indexOf(countKey)===-1 && dbRes[0]['nums']>0){
                        assertCountsListKey.push(countKey);
                    }
                } catch (err) {
                    assert.fail('test failed'+err);
                }
            }
            let allKey = 'game:count';
            let rows = await redis.instance.hgetall(allKey);
            assert.equal(assertCountsListKey.length,Object.keys(rows).length);
        });
    });
});
