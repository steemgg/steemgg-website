'use strict';


const fs = require('fs');
const path = require('path');
const util = require('util');
const steem = require('steem');
const mysql = require('mysql');
const config = require('config');
const sc2 = require('../lib/sc2');
const request = require('request');
const ipfsAPI = require('ipfs-api');
const CODE = require('../lib/code');
const decompress = require('decompress');
const formidable = require('formidable');
const steemitHelpers = require('../vendor/steemitHelpers');
const user = require('../models/user');
const redis = require('redis');
const querystring = require('querystring');

const client = redis.createClient({host: config.get('steemit.redis.host'), port:config.get('steemit.redis.port')});

exports.upload = function(req, res) {
    var userid = req.session.user.userid;
    var uploadDir = config.get('steemit.app.uploadurl');
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, function(err, fields, files) {
        if (err || !files['file']){
            console.log(err);
            return res.status(500).json({ resCode:CODE.FILE_UPLOAD_ERROR.RESCODE, err: CODE.FILE_UPLOAD_ERROR.DESC });
        }
        var ipfs = ipfsAPI({host: config.get('steemit.ipfs.ip'), port: config.get('steemit.ipfs.port'), protocol: 'http'});
        if(files['file'].type == 'application/zip') {
            unzipFile(files['file'].path, userid, function cb(unzips){
                console.log(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path);
                ipfs.util.addFromFs(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path, { recursive: true }, (err, result) => {
                    if (err) {
                        return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC });
                    }
                    res.status(200).json(result.slice(-1));
                })
            });
        } else {
            ipfs.util.addFromFs(files['file'].path, { recursive: true }, (err, result) => {
                if (err) {
                    return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC + err });
                }
                res.status(200).json(result);
            })
        }
    })
    form.on('fileBegin', function (name, file) {
        const fileExt = path.extname(file.name);
        file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}${fileExt}`)
        if(file.type == 'application/zip') {
            file.path = path.join(uploadDir, '/zip/', `${new Date().getTime()}.zip`)
        }
    })
};

exports.me = function(req, res) {
    user.me(req, res, function(err, users){
        if(!users) {
               return res.status(401).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE });
        } else {
               return res.status(200).json(users);
        }
    });
};
exports.postGame = function(req, res, next) {
    var user = req.session.user;
    var game = req.body;
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    api.setAccessToken(req.session.accessToken);

    cmysql(function cb(con){
        con.query('select * from games where id=?', [game.gameid] , (err, dbRes) => {
            if(err) {
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            }
            console.log(user)
            console.log(dbRes[0]['id'])
            if(user.account != dbRes[0]['account'] || game.gameid != dbRes[0]['id']) {
                con.end();
                return res.status(500).json({ resultCode: CODE.POST_ERROR.RESCODE, err: CODE.POST_ERROR.DESC });
            }
            var author = req.session.user.account;
            if (process.env.NODE_ENV === 'development' && author==='apple') {
                author = 'steemitgame.test';
            }
            console.log(author);
            var parentAuthor = "";
            var parentPermlink = "";

            const extensions = [[0, {
                beneficiaries: [
                    {
                        account: 'steemitgame.dev',
                        weight: 2500
                    }
                ]
            }]];

            const operations = [];

            const metaData = {
                community: 'steemitgame',
                tags: game.tags,
                app: `steemitgame.app/test`
            };

            const getPermLink = steemitHelpers.createPermlink(game.activityTitle, author, '', '');
            getPermLink.then(permlink => {
                console.log("permlink:"+ permlink);
                const commentOp = [
                    'comment',
                    {
                        parent_author: "",
                        parent_permlink: "steemitgame",
                        author: author,
                        permlink,
                        title: game.activityTitle,
                        body: game.activityDescription,
                        json_metadata: JSON.stringify(metaData)
                    },
                ];
                operations.push(commentOp);

                const commentOptionsConfig = {
                    author: author,
                    permlink,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions,
                };

                if (extensions) {
                    commentOptionsConfig.extensions = extensions;

                    if (game.reward === '100') {
                        commentOptionsConfig.percent_steem_dollars = 0;
                    } else {
                        commentOptionsConfig.percent_steem_dollars = 10000;
                    }

                    commentOptionsConfig.max_accepted_payout = '1000000.000 SBD';

                    operations.push(['comment_options', commentOptionsConfig]);
                }

                console.log("OPERATIONS", operations)
                api.broadcast(operations, function(err, result){
                    console.log(err, result);
                    if(err) {
                        return res.status(500).json({ resultCode: CODE.POST_ERROR.RESCODE, err: err.name });
                    }
                    var unix = Math.round(+new Date()/1000);
                    delete game.activityTitle;
                    delete game.activityDescription;
                    delete game.tags;
                    delete game.reward;
                    game.userid = req.session.user.userid;
                    game.account = req.session.user.account;
                    game.status = 0;
                    game.gameid = game.gameid;
                    game.lastModified = unix;
                    game.vote = 0;
                    game.payout = 0;
                    game.permlink = permlink;
                    cmysql(function cb(con){
                        con.query('INSERT INTO steemits SET ?', game, (err, dbRes) => {
                            if(err) {
                                console.log(err);
                                con.end();
                                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                            }
                            con.end();
                            return res.status(200).json(game);
                        });
                    });
                });
            });
        });
    });
}

exports.addGame = function(req, res, next) {
    var user = req.session.user;
    var game = req.body;
    var unix = Math.round(+new Date()/1000);
    game.userid = req.session.user.userid;
    game.account = req.session.user.account;
    game.status = 0;
    game.vote = 0;
    game.payout = 0;
    game.created = unix;
    game.lastModified = unix;
    //game.gameUrl = JSON.stringify(game.gameUrl || {});
    //game.coverImage = JSON.stringify(game.coverImage || {});
    console.log(game.gameUrl);
    cmysql(function cb(con){
        con.query('INSERT INTO games SET ?', game, (err, dbRes) => {
            if(err) {
                console.log(err);
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            }
            game.id = dbRes.insertId;
            con.end();
            return res.status(200).json(game);
        });
    });
    return;
};

exports.commentGame = function(req, res, next) {
    var user = req.session.user;
    var post = req.body;
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    api.setAccessToken(req.session.accessToken);
    var author = req.session.user.account;
    if (process.env.NODE_ENV === 'development' && author==='apple') {
        author = 'steemitgame.test';
    }
    const operations = [];
    const metaData = {
        community: 'steemitgame',
        tags: ['steemitgame'],
        app: `steemitgame.app/test`
    };
    const commentOp = [
        'comment',
        {
            parent_author: req.params.author,
            parent_permlink: req.params.permlink,
            author: author,
            permlink: steemitHelpers.createCommentPermlink(req.params.author, req.params.permlink),
            title: "",
            body: post.content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);
    api.comment(operations, function(err, result){
        console.log(err, result);
    });
    console.log("OPERATIONS", operations)
    api.broadcast(operations, function(err, result){
        if(err) {
            return res.status(500).json({ resultCode: CODE.POST_ERROR.RESCODE, err: err.name });
        }
        return res.status(200).send();
    });
};

exports.getGameDetail = function(req, res, next) {
        cmysql(function cb(con){
            con.query('select * from games where id=?', [req.params.id] , (err, dbRes) => {
                if(err) {
                    con.end();
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                } else {
                    if(dbRes.length>0){
                        con.query('select * from steemits where gameid=?', [req.params.id] , (err, steemitRes) => {
                            if(err) {
                                con.end();
                                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                            } else {
                                console.log(dbRes);
                                console.log(steemitRes);
                                if(steemitRes.length>0){
                                    dbRes[0]['activities'] = steemitRes;
                                }
                                con.end();
                                return res.status(200).json(dbRes[0]);
                            }
                        });
                    } else {
                        con.end();
                        return res.status(200).send();
                    }
                }
            });
        });
};
exports.updateGame = function(req, res, next) {
    var unix = Math.round(+new Date()/1000);
    var game = req.body;
    cmysql(function cb(con){
        con.query('update games set ? where id= ? and userid= ?', [{ title:game.title,coverImage:game.coverImage,description:game.description,category:game.category,gameUrl:game.gameUrl,lastModified:unix }, req.params.id, req.session.user.userid], (err, dbRes) => {
            if(err) {
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            } else {
                if (dbRes.changedRows == 1){
                    return res.status(200).send();
                } else {
                    return res.status(500).json({ resultCode: CODE.UPDATE_ERROR.RESCODE, err: CODE.UPDATE_ERROR.DESC });
                }
                con.end();
            }
        });
    });
};
exports.deleteGame = function(req, res, next) {
    var unix = Math.round(+new Date()/1000);
    cmysql(function cb(con){
        con.query('update games set status = 3 where id= ? and userid= ?', [req.params.id, req.session.user.userid], (err, dbRes) => {
            if(err) {
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            } else {
                console.log(dbRes);
                if (dbRes.changedRows == 1){
                    return res.status(200).send();
                } else {
                    return res.status(500).json({ resultCode: CODE.UPDATE_ERROR.RESCODE, err: CODE.UPDATE_ERROR.DESC } );
                }
                con.end();
            }
        });
    });
};

exports.listGame = function(req, res, next) {
    var data = req.body;
    var offset = (typeof req.query.offset !== 'undefined') ?  parseInt(req.query.offset,10) : 0;
    var pageSize = (typeof req.query.limit !== 'undefined') ? parseInt(req.query.limit, 10) : 20;
    var category = (typeof req.query.category !== 'undefined') ? req.query.category : '';
    var sort = (typeof req.query.sort !== 'undefined') ? req.query.sort : 'created_desc';
    var sortArr = sort.split("_")
    var type = (typeof req.query.type !== 'undefined') ? req.query.type : 'index';
    var url = querystring.stringify({ offset: offset, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], type:type });
    var nextUrl = querystring.stringify({ offset: offset+pageSize, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], type:type });
    var userid = req.session.user.userid;
    console.log(req.session.user);
    var gameQuery = 'status = 1';
    if (type === 'me'){
        gameQuery = 'status != 3 and userid='+ userid;
        if (typeof userid === 'undefined') {
            return res.status(401).json({resCode:CODE.NO_LOGIN_ERROR.RESCODE, err:CODE.NO_LOGIN_ERROR.DESC});
        }
    } else if(type ==='audit') {
        if (req.session.user.role === 0){
            return res.status(401).json({ resultCode: CODE.NO_AUDIT_ERROR.RESCODE, err: CODE.NO_AUDIT_ERROR.DESC });
        }
        gameQuery = 'status = 0';
    }
    if (category !='') {
        gameQuery = 'and category='+category;
    }
    var countSql = 'select count(1) as nums from games where ' + gameQuery;
    var querySql = 'select * from games where ' + gameQuery + ' order by ? ? limit ?,?';
    var query = [sortArr[0], sortArr[1], offset, pageSize];
    console.log(url)
    console.log(querySql)
    console.log(countSql)
    console.log(query)
    var href = 'game?' + url;
    cmysql(function cb(con){
        con.query(countSql, [] , (err, dbRes) => {
            if(err) {
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            }
            var count = dbRes[0]['nums'];
            if(count>0) {
                con.query(querySql , query , (err, dbRes) => {
                    if(err) {
                        con.end();
                        return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                    }
                    var next = 'game?'+ nextUrl;
                    if (count<(offset+pageSize)) {
                        next = '';
                    }
                    con.end();
                    return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
                });
            } else {
                con.end();
                return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count });
            }
        });
    });
};

exports.voteGame = function(req, res, next) {
    var data = req.body;
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    var voter = req.session.user.account;
    var author = req.params.author;
    var permlink = req.params.permlink;
    if (process.env.NODE_ENV === 'development' && voter ==='apple') {
        voter = 'steemitgame.test';
    }
    console.log(voter,author,permlink,data.weight);
    if( typeof voter === 'undefined' || typeof author === 'undefined' || typeof author === 'undefined' || typeof data.weight ==='undefined' ){
        return res.status(500).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
    }
    api.setAccessToken(req.session.accessToken);
    api.vote(voter, author, permlink, parseInt(data.weight), function (err, result) {
        console.log(err, result);
        if(err) {
            return res.status(500).json({ resultCode: CODE.VOTE_ERROR.RESCODE, err: err.name });
        }
        return res.status(200).send();
    });
}
exports.auditGame = function(req, res, next) {
    if (req.session.user.role === 0){
        return res.status(401).json({ resultCode: CODE.NO_AUDIT_ERROR.RESCODE, err: CODE.NO_AUDIT_ERROR.DESC });
    }
    cmysql(function cb(con){
        con.query('update games set status=1 where id= ?', [req.params.id], (err, dbRes) => {
            if(err) {
                con.end();
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            } else {
                if (dbRes.changedRows == 1){
                    return res.status(200).send();
                } else {
                    return res.status(500).json({ resultCode: CODE.UPDATE_ERROR.RESCODE, err: CODE.UPDATE_ERROR.DESC });
                }
                con.end();
            }
        });
    });
}

exports.index = function(req, res, next) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    var url = api.getLoginURL(1);
  res.render('index', { title: '$$$ hello! Steem Game $$$', login: url });
};

exports.logout = function(req, res, next) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    api.revokeToken(function (err, res) {
        if(err){
            console.log(err);
            return;
        }
        return;
    });
    res.clearCookie('at');
    req.session.destroy(function(err) {
        if(err){
            res.status(500).json({ resultCode: CODE.SESSION_ERROR.RESCODE, err: CODE.SESSION_ERROR.DESC });
            return;
        }
        return;
    });
    res.status(200).send();
};

exports.test = function(req, res, next) {
    client.get("token:userid:477514", function (err, reply) {
        console.log(reply.toString()); // Will print `OK`
        var api = sc2.Initialize({
            app: config.get('steemit.sc.app'),
            callbackURL: config.get('steemit.sc.cburl'),
            baseURL: config.get('steemit.sc.url'),
            scope: config.get('steemit.sc.scope')
        });
        api.setAccessToken(reply.toString());
        api.reToken(function (err, res) {
                console.log(res,err);
            if(err){
                console.log(err);
                return;
            }
            return;
        });
    });
    res.status(200).send();
}

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb(files);
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

