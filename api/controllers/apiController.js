'use strict';

var formidable = require('formidable'),
    fs = require('fs'),
    path = require('path'),
    unzip = require('unzip'),
    util = require('util'),
    steem = require('steem'),
    config = require('config'),
    request = require('request'),
    sc2 = require('../lib/sc2');

exports.upload = function(req, res) {
    var uploadDir = config.get('steemit.app.uploadurl');
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({ error: err })
            var hash;
            uploadIPFS(files['file'].path, function cb(hash){
            if(files['file'].type == 'application/zip') {
                console.log('unzip file');
            }
            res.status(200).json({ uploaded: true, path: files['file'], ipfsHash: hash })
        });
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
        callbackURL: config.get('steemit.sc.cburl'),
        baseURL: config.get('steemit.sc.url'),
        scope: config.get('steemit.sc.scope')
    });

    var sc2url = config.get('steemit.app.sc2') + '/api/me';
    var clientServerOptions = {
        uri: sc2url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': req.query.token
        }
    }
    request(clientServerOptions, function (error, response) {
        console.log(error,response.body);
        res.status(200).json(JSON.parse(response.body))
        return;
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

function uploadIPFS(file, hash) {
    console.log('upload file to IPFS')
    var ipfs = config.get('steemit.app.ipfs') + '/api/v0/add';
    var req = request.post(ipfs, function (err, resp, body) {
        if (err) {
            console.log(err);
        } else {
            var obj = JSON.parse(body);
            console.log('Hash: ' + obj.Hash);
            hash(obj.Hash);
        }
    });
    var form = req.form();
    form.append('file', fs.createReadStream(file));
};

function unzipFile(file) {
    var readStream = fs.createReadStream(file);
    var writeStream = fstream.Writer(config.get('steemit.app.gameurl'));

    readStream
        .pipe(unzip.Parse())
        .pipe(writeStream)
}

