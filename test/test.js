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
let testUserId = '1';
let testGameId = '1';

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
        await db.execute(db.WRITE, 'delete from activities where userid= ?', [testUserId]);
        await db.execute(db.WRITE, 'delete from comments where userid= ?', [testUserId]);
        await db.execute(db.WRITE, 'delete from games where id= ? and userid= ?', [testGameId,testUserId]);
    });
    after(async function() {
        await db.execute(db.WRITE, 'delete from activities where userid= ?', [testUserId]);
        await db.execute(db.WRITE, 'delete from comments where userid= ?', [testUserId]);
        await db.execute(db.WRITE, 'delete from games where id= ? and userid= ?', [testGameId,testUserId]);
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
            let dbRes = await game.addGame(gameInfo);
            assert.equal(dbRes.affectedRows, 1);
        });
    });
    describe('#query game info', function() {
        it('should return game info ',async function() {
            let dbRes = await game.getGameById(testGameId);
            assert.equal(dbRes[0].id, testGameId);
        });
    });
    describe('#delete game', function() {
        it('should deleted',async function() {
            await game.deleteGame([testGameId,testUserId]);
            let dbRes = await game.getGameById(testGameId);
            assert.equal(dbRes[0].status, 3);
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
            await game.updateGame([gameInfo,testGameId,testUserId]);
            let dbRes = await game.getGameById(testGameId);
            assert.equal(dbRes[0].gameUrl, 'modify test');
        });
    });
    describe('#audit game', function() {
        it('should audit',async function() {
            let unix = Math.round(+new Date()/1000);
            let audit = { userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'http',comment:'audit', type:1};
            await game.auditGame(audit,2);
            let dbRes = await game.getGameById(testGameId);
            assert.equal(dbRes[0].status, 2);
        });
        it('should has comment',async function() {
            let dbRes = await game.auditComments([testGameId]);
            assert.equal(dbRes[0].permlink, 'http');
        });
    });
    describe('#report game', function() {
        it('should report',async function() {
            let unix = Math.round(+new Date()/1000);
            let report = { userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'report http', comment:'report'};
            await game.reportGame(report);
            let dbRes = await game.getGameById(testGameId);
            assert.equal(dbRes[0].report, 1);
        });
        it('should has comment',async function() {
            let dbRes = await game.reportComments([testGameId]);
            assert.equal(dbRes[0].permlink, 'report http');
        });
        it('can report',async function() {
            let dbRes = await game.canReportGame([testUserId,testGameId]);
            assert.equal(dbRes.length, 1);
        });
    });
    describe('#activity', function() {
        it('should activity',async function() {
            let unix = Math.floor(new Date() / 1000) - 86400*8;
            let activity = {userid:testUserId, account:testAccount, gameid:testGameId, lastModified:unix, permlink:'activity'};
            await game.addActivity(activity);
            let dbRes = await game.getActivitiesById(testGameId);
            assert.equal(dbRes[0].permlink, 'activity');
        });
        it('should recently activity',async function() {
            let dbRes = await game.getRecentlyActivity(testGameId);
            assert.equal(dbRes[0].permlink, 'activity');
        });
        it('should payout activity',async function() {
            let dbRes = await game.getPayoutActivities(testGameId);
            assert.equal(dbRes[0].permlink, 'activity');
        });
    });
});

describe('Query', function() {
    before(async function() {
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
            let dbRes = await game.addGame(gameInfo);
        }
    });
    after(async function() {
        await db.execute(db.WRITE, 'delete from games where userid= ?', [testUserId]);
        await game.clearCache();
    });
    describe('#game nums', function() {
        it('should return nums ',async function() {
            let params = {};
            params['status'] = 1;
            params['report'] = 0;
            params['recommend'] = 0;
            params['account'] = '';
            params['category'] = '';
            let dbRes = await game.countOfGames(params);
            let key = 'game:count:s:'+params['status']+':r:'+params['report']+':remm:'+params['recommend']+':a:'+params['account']+':c:'+params['category'];
            let rows = await redis.instance.get(key);
            let assertRes = JSON.parse(rows);
            assert.equal(dbRes[0].nums, assertRes[0].nums);
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
            let dbRes = await game.gameList(params);
            let rows = await redis.instance.get(key);
            let assertRes = JSON.parse(rows);
            assert.equal(dbRes[0].id, assertRes[0].id);
        });
        it('should return null ',async function() {
            await game.clearCache();
            let rows = await redis.instance.get(key);
            assert.equal(rows, null);
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
                let dbRes = await game.gameList(params);
                if(assertListKey.indexOf(key)===-1 && dbRes.length>0){
                    assertListKey.push(key);
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
                let dbRes = await game.countOfGames(params);
                if(assertCountsListKey.indexOf(countKey)===-1 && dbRes[0]['nums']>0){
                    assertCountsListKey.push(countKey);
                }
            }
            let allKey = 'game:count';
            let rows = await redis.instance.hgetall(allKey);
            assert.equal(assertCountsListKey.length,Object.keys(rows).length);
        });
    });
});
