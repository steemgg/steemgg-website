'use strict';

const fs = require('fs');
const config = require('config');
const CODE = require('../lib/code');
const user = require('../models/user');
const redis = require('redis');

const client = redis.createClient({host: config.get('steemit.redis.host'), port:config.get('steemit.redis.port')});

module.exports = function(app) {
  var api  = require('../controllers/apiController');

  app.post('/v1/upload', [morkSessionMiddleware, userMiddleware], api.upload);
  app.get('/v1/game', [morkSessionMiddleware], api.listGame);
  app.post('/v1/game', [morkSessionMiddleware, userMiddleware], api.addGame);
  app.post('/v1/post', [morkSessionMiddleware, userMiddleware], api.postGame);
  app.get('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.getGameDetail);
  app.put('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.updateGame);
  app.delete('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.deleteGame);
  app.post('/v1/audit/:id', [morkSessionMiddleware, userMiddleware], api.auditGame);
  app.post('/v1/comment/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.commentGame);
  app.post('/v1/vote/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.voteGame);
  app.post('/v1/report/:id', [morkSessionMiddleware, userMiddleware], api.reportGame);
  app.get('/v1/me', [morkMiddleware], api.me);
  app.get('/v1/logout', api.logout);
  app.get('/v1/test', api.test);
  app.get('/', api.index);

  var callback  = require('../controllers/callbackController');
  app.get('/callback', callback.auth);
};

function morkMiddleware (req, res, next) {
    if (!req.session.accessToken && process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined' && req.cookies['at'].length<10) {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', function (err, result) {
            if (err) {
                console.log({resCode:CODE.TEST_DATA_ERROR.RESCODE, err:CODE.TEST_DATA_ERROR.DESC});
                next();
            } else {
                req.session.user = JSON.parse(result);
                res.status(200).json(JSON.parse(result));
            }
        });
        return;
    }
    next();
}

function morkSessionMiddleware (req, res, next) {
    if (!req.session.accessToken && process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined' && req.cookies['at'].length<10) {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', function (err, result) {
            if (err) {
                console.log({resCode:CODE.TEST_DATA_ERROR.RESCODE, err:CODE.TEST_DATA_ERROR.DESC});
                next();
            } else {
                client.get("token:userid:477514", function (err, at) {
                    console.log(at);
                    req.session.accessToken = at.toString();
                    req.session.user = JSON.parse(result);
                    next();
                });
            }
        });
    } else {
        next();
    }
}

function userMiddleware (req, res, next) {
    console.log(req.session.user)
    if (!req.session.user) {
        return res.status(401).json({resCode:CODE.NEED_LOGIN_ERROR.RESCODE, err:CODE.NEED_LOGIN_ERROR.DESC});
    } else {
        next();
    }
}

