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
        file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}.${fileExt}`)
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

exports.addGame = function(req, res, next) {
    var user = req.session.user;
    var game = req.body;
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    api.setAccessToken(req.session.accessToken);
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
        tags: ['steemitgame','test'],
        app: `steemitgame.app/test`
    };

    const getPermLink = steemitHelpers.createPermlink(game.title, user.username, '', '');
    getPermLink.then(permlink => {
        console.log("permlink:"+ permlink);
        const commentOp = [
            'comment',
            {
                parent_author: "",
                parent_permlink: "steemitgame",
                author: req.session.user.username,
                permlink,
                title: game.activityTitle,
                body: game.activityDescription,
                json_metadata: JSON.stringify(metaData)
            },
        ];
        operations.push(commentOp);

        const commentOptionsConfig = {
            author: req.session.user.username,
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
            game.userid = req.session.user.userid;
            game.account = req.session.user.username;
            game.status = 0;
            game.created = unix;
            game.lastModified = unix;
            game.permlink = permlink;
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
        });
    });
};

exports.getGameDetail = function(req, res, next) {
        cmysql(function cb(con){
            con.query('select * from games where id=?', [req.params.id] , (err, dbRes) => {
                if(err) {
                    con.end();
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                } else {
                    con.end();
                    return res.status(200).json(dbRes);
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
    var href = 'games?offset='+offset+'&limit='+pageSize+'&type='+req.query.type;
    if (req.query.type === 'index') {
        cmysql(function cb(con){
            con.query('select count(1) as nums from games where status != 3' , (err, dbRes) => {
                if(err) {
                    con.end();
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games where status != 3 order by created desc limit ?,?' , [offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            con.end();
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
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
    } else if(req.query.type === 'me') {
        var userid = req.session.user.userid;
        cmysql(function cb(con){
            con.query('select count(1) as nums from games where userid=? and status !=3', [userid] , (err, dbRes) => {
                if(err) {
                    con.end();
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games where userid=? and status !=3 order by lastModified desc limit ?,?' , [userid, offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            con.end();
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
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
    } else if(req.query.type === 'audit') {
        if(req.session.user.role === 0) {
            return res.status(401).json({ resultCode: CODE.NO_AUDIT_ERROR.RESCODE, err: CODE.NO_AUDIT_ERROR.DESC });
        }
        cmysql(function cb(con){
            con.query('select count(1) as nums from games where status=0', (err, dbRes) => {
                if(err) {
                    con.end();
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games where status=0 order by lastModified desc limit ?,?' , [offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            con.end();
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
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
    } else {
        return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err: CODE.ERROR.DESC });
    }
};

exports.index = function(req, res, next) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    var url = api.getLoginURL();
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
            //res.status(401).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err: err.error_description });
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

