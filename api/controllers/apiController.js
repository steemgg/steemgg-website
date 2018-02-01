'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('config');
const ipfsAPI = require('ipfs-api');
const CODE = require('../lib/code');
const decompress = require('decompress');
const formidable = require('formidable');
const user = require('../models/user');
const steem = require('../models/steem');
const game = require('../models/game');
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
    steem.me(req.session.accessToken, function (err, result) {
        if(err){
            return res.status(401).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.error_description });
        }
        user.getUserByAccount(result.user, function cb(err, dbRes){
                if(err) {
                    console.log(err)
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                }
                var userInfo = dbRes[0];
                if(typeof dbRes[0] === 'undefined') {
                    userInfo = {'account':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'createtime':Math.round(+new Date()/1000)};
                    user.addUser(userInfo, function cb(err, dbRes){
                        if(err) {
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                        }
                    });
                }
                req.session.user = userInfo;
                client.set("token:userid:"+userInfo.userid, req.session.accessToken);
                return res.status(200).json(userInfo);
        });

    });
};

exports.postGame = function(req, res, next) {
    var data = req.body;
    var userInfo = req.session.user;
    console.log(data);
    game.getGameById(data.gameid, function(err, dbRes){
        if(err) {
            console.log(err)
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        }
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        if(userInfo.account != dbRes[0]['account'] || data.gameid != dbRes[0]['id']) {
            return res.status(500).json({ resultCode: CODE.PARAMS_INCONSISTENT_ERROR.RESCODE, err: CODE.PARAMS_INCONSISTENT_ERROR.DESC });
        }
        var author = req.session.user.account;
        if (process.env.NODE_ENV === 'development' && author==='apple') {
            author = 'steemitgame.test';
        }
        steem.post(req.session.accessToken, author, data.activityTitle, data.activityDescription, data.reward, data.tags, function(err, result, permlink){
            console.log(err, result, permlink);
            if(err) {
                return res.status(500).json({ resultCode: CODE.POST_ERROR.RESCODE, err: err.error_description });
            }
            var unix = Math.round(+new Date()/1000);
            var activity = {userid:req.session.user.userid, account:req.session.user.account,gameid: data.gameid,lastModified: unix, permlink:permlink };
            game.addActivity(activity, function(err, dbRes){
                if(err) {
                    console.log(err);
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                }
                return res.status(200).json(activity);
            });
        });
    });
}

exports.addGame = function(req, res, next) {
    var userInfo = req.session.user;
    var data = req.body;
    var unix = Math.round(+new Date()/1000);
    var gameInfo = {userid:req.session.userInfo.userid,account:req.session.userInfo.account,created:unix,lastModified:unix,gameUrl:data.gameUrl,coverImage:data.coverImage,version:data.version}
    game.addGame(gameInfo,function(err, dbRes){
        if(err) {
            console.log(err);
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        }
        gameInfo.id = dbRes.insertId;
        return res.status(200).json(gameInfo);
    });
};

exports.commentGame = function(req, res, next) {
    var userInfo = req.session.user;
    var post = req.body;
    var author = req.session.user.account;
    if (process.env.NODE_ENV === 'development' && author==='apple') {
        author = 'steemitgame.test';
    }
    steem.comment(req.session.accessToken, req.params.author,req.params.permlink, author, post.content, function(err, result){
        if(err) {
            return res.status(500).json({ resultCode: CODE.COMMENT_ERROR.RESCODE, err: err.error_description });
        }
        return res.status(200).send();
    });
};

exports.getGameDetail = function(req, res, next) {
    game.getGameById(req.params.id,function(err, dbRes){
        if(err) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        }
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        game.getActivitiesById(req.params.id,function(err,steemitRes){
            if(err) {
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
            }
            if(steemitRes.length>0){
                dbRes[0]['activities'] = steemitRes;
            }
            return res.status(200).json(dbRes[0]);
        });
    });
};
exports.updateGame = function(req, res, next) {
    var unix = Math.round(+new Date()/1000);
    var data = req.body;
    game.updateGame([{ title:data.title,coverImage:data.coverImage,description:data.description,category:data.category,gameUrl:data.gameUrl,lastModified:unix }, req.params.id, req.session.user.userid],function(err, dbRes){
        if(err) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        } else {
            if (dbRes.changedRows == 1){
                return res.status(200).send();
            } else {
                return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
            }
        }
    });
};
exports.deleteGame = function(req, res, next) {
    game.deleteGame([req.params.id, req.session.user.userid], function(err, dbRes){
        if(err) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        } else {
            if (dbRes.changedRows == 1){
                return res.status(200).send();
            } else {
                return res.status(500).json({ resultCode: CODE.DELETE_GAME_ERROR.RESCODE, err: CODE.DELETE_GAME_ERROR.DESC } );
            }
        }
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
    var gameQuery = 'status = 1';
    if (type === 'me'){
        gameQuery = 'status != 3 and userid='+ userid;
        if (typeof userid === 'undefined') {
            return res.status(401).json({resCode:CODE.NEED_LOGIN_ERROR.RESCODE, err:CODE.NEED_LOGIN_ERROR.DESC});
        }
    } else if(type ==='audit') {
        if (req.session.user.role === 0){
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        gameQuery = 'status = 0';
    }
    if (category !='') {
        gameQuery = 'and category='+category;
    }
    var countSql = 'select count(1) as nums from games where ' + gameQuery;
    var querySql = 'select * from games where ' + gameQuery + ' order by ? ? limit ?,?';
    var queryParams = [sortArr[0], sortArr[1], offset, pageSize];
    var href = 'game?' + url;
    game.query(countSql, [], function(err, dbRes){
        if(err) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
        }
        var count = dbRes[0]['nums'];
        var next = '';
        if(count>0) {
            game.query(querySql, queryParams, function(err, dbRes){
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                }
                if (count>=(offset+pageSize)) {
                    next = 'game?'+ nextUrl;
                }
                return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
            });
        } else {
            return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count });
        }
    });
};

exports.voteGame = function(req, res, next) {
    var data = req.body;
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
    steem.vote(req.session.accessToken, voter, author, permlink, parseInt(data.weight), function (err, result) {
        if(err) {
            return res.status(500).json({ resultCode: CODE.VOTE_ERROR.RESCODE, err: err.error_description });
        }
        return res.status(200).send();
    });
}

exports.auditGame = function(req, res, next) {
    var data = req.body;
    if (req.session.user.role === 0){
        return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
    }
    game.getRecentlyActivity(req.params.id, function(err, dbRes){
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        var author = req.session.user.account;
        if (process.env.NODE_ENV === 'development' && author==='apple') {
            author = 'steemitgame.test';
        }
        if (process.env.NODE_ENV === 'development' && dbRes[0].account==='apple') {
            dbRes[0].account = 'steemitgame.test';
        }
        steem.comment(req.session.accessToken, dbRes[0].account,dbRes[0].permlink, author, data.comment, function(err, result){
            if(err) {
                return res.status(500).json({ resultCode: CODE.COMMENT_ERROR.RESCODE, err: err.error_description });
            }
            game.auditGame([data.status,req.params.id],function(err, dbRes){
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                }
                if (dbRes.changedRows == 1){
                    return res.status(200).send();
                } else {
                    return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
                }
            });
        });
    });
}

exports.reportGame = function(req, res, next) {
    var data = req.body;
    if (req.session.user.role === 0){
        return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
    }
    game.getRecentlyActivity(req.params.id, function(err, dbRes){
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        var author = req.session.user.account;
        if (process.env.NODE_ENV === 'development' && author === 'apple') {
            author = 'steemitgame.test';
        }
        if (process.env.NODE_ENV === 'development' && dbRes[0].account === 'apple') {
            dbRes[0].account = 'steemitgame.test';
        }
        steem.comment(req.session.accessToken, dbRes[0].account,dbRes[0].permlink, author, data.comment, function(err, result){
            if(err) {
                return res.status(500).json({ resultCode: CODE.COMMENT_ERROR.RESCODE, err: err.error_description });
            }
            game.reportGame([data.report,req.params.id], function(err, dbRes){
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.code+' '+err.errno+' '+err.sqlMessage });
                }
                if (dbRes.changedRows == 1){
                    return res.status(200).send();
                } else {
                    return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
                }
            });
        });
    });
}

exports.index = function(req, res, next) {
    steem.getLoginUrl(function(url){
        res.render('index', { title: '$$$ hello! Steem Game $$$', login: url });
    })
};

exports.logout = function(req, res, next) {
    steem.revokeToken(function(err, res){
        if(err){
            console.log(err)
            res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err: err.error_description });
        }
        res.clearCookie('at');
        req.session.destroy(function(err) {
            if(err){
                res.status(500).json({ resultCode: CODE.CLEAR_SESSION_ERROR.RESCODE, err: CODE.CLEAR_SESSION_ERROR.DESC });
            }
            return
        });
        res.status(200).send();
    });
    return
};

exports.test = function(req, res, next) {
    client.get("token:userid:477514", function (err, reply) {
        console.log(reply.toString()); // Will print `OK`
        steem.reflashToken(reply.toString(), function(err, res){
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

