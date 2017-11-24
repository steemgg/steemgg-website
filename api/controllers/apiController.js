'use strict';

var formidable = require('formidable'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    steem = require('steem'),
    config = require('config');

exports.upload = function(req, res) {
    var uploadDir = config.get('Steemit.dev.username');
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({ error: err })
        res.status(200).json({ uploaded: true, path: files['file'] })
    })
    form.on('fileBegin', function (name, file) {
        const [fileName, fileExt] = file.name.split('.')
        file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}.${fileExt}`)
        if(file.type == 'application/zip') {
            file.path = path.join(uploadDir, '/zip/', `${new Date().getTime()}.zip`)
        }
    })
};

exports.index = function(req, res, next) {
    var username = config.get('Steemit.dev.username');
    var password = config.get('Steemit.dev.password');
    var permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    var wif = steem.auth.toWif(username, password, 'posting');
    console.log(wif);
    steem.broadcast.comment(password, '', 'test', username, permlink, "test", "testbody", { tags: ['test'], app: 'steemgame/examples' }, function(err, result) {
        console.log(err, result);
    });
    //steem.api.getDiscussionsByCreated({'tag':'cn','limit':1}, function(err, result) {
    //    console.log(err, result);
    //});
  res.render('index', { title: '$$$ hello! Steem Game $$$' });
};

