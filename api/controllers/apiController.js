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
    sc2 = require('../lib/sc2');

exports.upload = function(req, res) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        scope: config.get('steemit.sc.scope'),
        baseURL: config.get('steemit.sc.url'),
        callbackURL: config.get('steemit.sc.cburl')
    });
    if (req.session.accessToken == null && process.env.NODE_ENV === 'development') {
        console.log('cookies');
        api.setAccessToken(req.cookies['at']);
    } else {
        console.log('session');
        api.setAccessToken(req.session.accessToken);
    } 
    api.me(function (err, result) {
        var me = JSON.parse(result.body)
        if(me.error){
            return res.status(500).json({ error: me.error_description })
        }
        console.log(me.account.id);
        var userid = me.account.id;
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
                                console.log(err);
                                return res.send();
                            }
                            res.status(200).json({ uploaded: true, ret: result.slice(-1) });
                        })
                    });
                } else {
                       ipfs.util.addFromFs(files['file'].path, { recursive: true }, (err, result) => {
                            if (err) { 
                                console.log(err);
                                return res.send();
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
    });
};

exports.me = function(req, res) {
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        scope: config.get('steemit.sc.scope'),
        baseURL: config.get('steemit.sc.url'),
        callbackURL: config.get('steemit.sc.cburl')
    });
    //console.log(req);
    if (req.session.accessToken == null && process.env.NODE_ENV === 'development') {
        console.log(req.cookies);
        api.setAccessToken(req.cookies['at']);
    } else {
        console.log(req.session.accessToken);
        api.setAccessToken(req.session.accessToken);
    } 
    api.me(function (err, result) {
        var me = JSON.parse(result.body)
        if(me.error){
            return res.status(500).json({ error: me.error_description })
        }
        res.status(200).json(JSON.parse(result.body));
    });
};

exports.index = function(req, res, next) {
    //var username = config.get('steemit.dev.username');
    //var password = config.get('steemit.dev.password');
    //var permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    //var wif = steem.auth.toWif(username, password, 'posting');
    //console.log(wif);
    //steem.broadcast.comment(password, '', 'test', username, permlink, "test", "testbody", { tags: ['test'], app: 'steemgame/examples' }, function(err, result) {
    //    console.log(err, result);
    //});
    //steem.api.getDiscussionsByCreated({'tag':'cn','limit':1}, function(err, result) {
    //    console.log(err, result);
    //});
    var api = sc2.Initialize({
        app: config.get('steemit.sc.app'),
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });
    var url = api.getLoginURL();
  res.render('index', { title: '$$$ hello! Steem Game $$$', login: url});
};

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb(files);
        console.log(files);
    });
}

