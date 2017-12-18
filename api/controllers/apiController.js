'use strict';

var formidable = require('formidable'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    steem = require('steem'),
    config = require('config'),
    request = require('request'),
    decompress = require('decompress'),
    ipfsAPI = require('ipfs-api'),
    mysql = require('mysql'),
    sc2 = require('../lib/sc2'),
    CODE = require('../lib/code');

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
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        scope: config.get('steemit.sc.scope'),
        baseURL: config.get('steemit.sc.url'),
        callbackURL: config.get('steemit.sc.cburl')
    });
    api.setAccessToken(req.session.accessToken);
    var user;
    api.me(function (err, result) {
        if(err != null){
            return res.status(401).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err: err.error_description });
        }
        //check user
        cmysql(function cb(con){
            con.query('select * from user where username = ?' , result.user,(err, dbRes) => {
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                user = dbRes[0];
                if(!dbRes[0].id) {
                    user = {'username':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'createtime':Math.round(+new Date()/1000)};
                    con.query('INSERT INTO user SET ?', user, (err, dbRes) => {
                        if(err) {
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                    });
                }
                req.session.user = user;
                res.status(200).json(user);
            });
        });
    });
};

exports.addGame = function(req, res, next) {
    var game = req.body;
    var unix = Math.round(+new Date()/1000);
    game.userid = req.session.user.userid;
    game.account = req.session.user.username;
    game.status = 0;
    game.createtime = unix;
    game.updatetime = unix;
    cmysql(function cb(con){
        con.query('INSERT INTO games SET ?', game, (err, dbRes) => {
            if(err) {
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
            }
            game.id = dbRes.insertId;
            return res.status(200).json(game);
        });
    });
};

exports.getGameDetail = function(req, res, next) {
        cmysql(function cb(con){
            con.query('select * from games where id=?', [req.params.id] , (err, dbRes) => {
                if(err) {
                    return res.status(500).json({resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC});
                } else {
                    return res.status(200).json(dbRes);
                }
            });
        });
};
exports.updateGame = function(req, res, next) {
    var unix = Math.round(+new Date()/1000);
    var game = req.body;
    cmysql(function cb(con){
        console.log(game);
        console.log(req.session.user.userid);
        con.query('update games set ? where id= ? and userid= ?', [{title:game.title,coverImg:game.coverImg,desc:game.desc,category:game.category,activity:game.activity,comment:game.comment,gameIndex:game.gameIndex,updatetime:unix}, req.params.id, req.session.user.userid], (err, dbRes) => {
            if(err) {
                return res.status(500).json({resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC});
            } else {
                if (dbRes.changedRows == 1){
                    return res.status(200).json(game);
                } else {
                    return res.status(500).json({resultCode: CODE.UPDATE_ERROR.RESCODE, err: CODE.UPDATE_ERROR.DESC});
                }
            }
        });
    });
};
exports.deleteGame = function(req, res, next) {
    var unix = Math.round(+new Date()/1000);
    cmysql(function cb(con){
        con.query('update games set status = 0 where id= ? and userid= ?', [req.params.id, req.session.user.userid], (err, dbRes) => {
            if(err) {
                return res.status(500).json({resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC});
            } else {
                if (dbRes.changedRows == 1){
                    return res.status(200).json(game);
                } else {
                    return res.status(500).json({resultCode: CODE.UPDATE_ERROR.RESCODE, err: CODE.UPDATE_ERROR.DESC});
                }
            }
        });
    });
    return res.status(200).json({ resCode:CODE.SUCCESS.RESCODE, ret:req.params.id} );
};

exports.listGame = function(req, res, next) {
    var data = req.body;
    var offset = (typeof req.query.offset !== 'undefined') ?  parseInt(req.query.offset,10) : 0;
    var pageSize = (typeof req.query.limit !== 'undefined') ? parseInt(req.query.limit, 10) : 20;
    var href = 'games?offset='+offset+'&limit='+pageSize+'&type='+req.query.type;
    if (req.query.type === 'index') {
        cmysql(function cb(con){
            con.query('select count(1) as nums from games' , (err, dbRes) => {
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games order by updatetime desc limit ?,?' , [offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
                        if (count<(offset+pageSize)) {
                            next = '';
                        }
                        return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
                    });
                } else {
                    return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count});
                }
            });
        });
    } else if(req.query.type === 'me') {
        var userid = req.session.user.userid;
        cmysql(function cb(con){
            con.query('select count(1) as nums from games where userid=?', [userid] , (err, dbRes) => {
                if(err) {
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games where userid=? order by updatetime desc limit ?,?' , [userid, offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
                        if (count<(offset+pageSize)) {
                            next = '';
                        }
                        return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
                    });
                } else {
                    return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count});
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
                    return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                }
                var count = dbRes[0]['nums'];
                if(count>0) {
                    con.query('select * from games where status=0 order by updatetime desc limit ?,?' , [offset, pageSize] , (err, dbRes) => {
                        if(err) {
                            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: CODE.DB_ERROR.DESC });
                        }
                        var next = 'games?offset='+(offset+pageSize)+'&limit='+pageSize+'&type='+req.query.type;
                        if (count<(offset+pageSize)) {
                            next = '';
                        }
                        return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
                    });
                } else {
                    return res.status(200).json({offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count});
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
  res.render('index', { title: '$$$ hello! Steem Game $$$', login: url});
};

exports.logout = function(req, res, next) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    api.revokeToken(function (err, res) {
        if(err != null){
            res.status(401).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err: err.error_description });
        }
        return;
    });
    res.clearCookie('at');
    req.session.destroy(function(err) {
        if(err){
            res.status(500).json({ resultCode: CODE.SESSION_ERROR.RESCODE, err: CODE.SESSION_ERROR.DESC });
        }
        return;
    });
    res.status(200).json([]);
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

