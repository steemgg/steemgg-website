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
    sc2 = require('../lib/sc2');

exports.upload = function(req, res) {
    var userid = req.session.user.account.id;
    var uploadDir = config.get('steemit.app.uploadurl');
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({ error: err })
        var ipfs = ipfsAPI({host: config.get('steemit.ipfs.ip'), port: config.get('steemit.ipfs.port'), protocol: 'http'});
        if(files['file'].type == 'application/zip') {
            console.log('unzip file');
            unzipFile(files['file'].path, userid, function cb(unzips){
                console.log(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path);
                ipfs.util.addFromFs(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path, { recursive: true }, (err, result) => {
                    if (err) { 
                        return res.status(500).json({ error: err });
                    }
                    res.status(200).json({ uploaded: true, ret: result.slice(-1) });
                })
            });
        } else {
            ipfs.util.addFromFs(files['file'].path, { recursive: true }, (err, result) => {
                if (err) { 
                    return res.status(500).json({ error: err });
                }
                res.status(200).json({ uploaded: true, ret: result });
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
    //if (req.session.accessToken == null && process.env.NODE_ENV === 'development') {
    //    api.setAccessToken(req.cookies['at']);
    //} else {
    api.setAccessToken(req.session.accessToken);
    //}
    api.me(function (err, result) {
        if(err != null){
            return res.status(401).json({ error: err });
        }
        req.session.user = result;
        res.status(200).json(result);
    });
};

exports.addGame = function(req, res, next) {
    var game = req.body;
    var unix = Math.round(+new Date()/1000);
    game.userid = req.session.user.account.id;
    game.status = 1;
    game.createtime = unix;
    game.updatetime = unix;
    cmysql(function cb(con){
        console.log('con is ok');
        con.query('INSERT INTO games SET ?', game, (err, dbRes) => {
            if(err) {
                console.log(err);
            }
            console.log('Last insert ID:', dbRes.insertId);
            game.id = dbRes.insertId;
            con.end();
            res.status(200).json(game);
        });
    });
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
            return res.status(401).json({ error: err })
        }
    });
    res.status(200).json('ok');
};

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb(files);
        console.log(files);
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
        console.log('Connection established');
    });
    cb(con);

    //con.end((err) => {
    //    // The connection is terminated gracefully
    //    // Ensures all previously enqueued queries are still
    //    // before sending a COM_QUIT packet to the MySQL server.
    //});
}

