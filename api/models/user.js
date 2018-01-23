const config = require('config');
const sc2 = require('../lib/sc2');
const mysql = require('mysql');
const redis = require('redis');

var api = sc2.Initialize({
    app: config.get('steemit.sc.app'),
    scope: config.get('steemit.sc.scope'),
    baseURL: config.get('steemit.sc.url'),
    callbackURL: config.get('steemit.sc.cburl')
});
var user;
var client = redis.createClient({host: config.get('steemit.redis.host'), port:config.get('steemit.redis.port')});

function me(req, res, callback)  {
    api.setAccessToken(req.session.accessToken);
    api.me(function (err, result) {
        if(err != null){
            callback(err);
            return;
        }
        cmysql(function cb(con){ con.query('select * from user where account = ?' , result.user,(err, dbRes) => {
                if(err) {
                    con.end();
                    callback(err);
                    return;
                }
                user = dbRes[0];
                if(typeof dbRes[0] === 'undefined') {
                    user = {'account':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'createtime':Math.round(+new Date()/1000)};
                    con.query('INSERT INTO user SET ?', user, (err, dbRes) => {
                        if(err) {
                            con.end();
                            callback(err);
                            return;
                        }
                    });
                }
                con.end();
                req.session.user = user;
                client.set("token:userid:"+user.userid, req.session.accessToken);
                callback(true, user);
            });
        });
    });
}

function cmysql(cb) {
    const con = mysql.createConnection({
        host: config.get('steemit.db.host'),
        user: config.get('steemit.db.dbUser'),
        password: config.get('steemit.db.dbPass'),
        database: config.get('steemit.db.dbName'),
    });

    con.connect((err) => {
        if(err){
            console.log('Error connecting to Db');
            return;
        }
    });
    cb(con);
}

module.exports = {
    me: function(req, res, callback) {
        return me(req, res, callback);
    }
}
