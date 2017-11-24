'use strict';

var formidable = require('formidable'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    steem = require('steem');

exports.auth = function(req, res, next) {
  res.render('index', { title: '$$$ hello! Steem Game $$$' });
};

