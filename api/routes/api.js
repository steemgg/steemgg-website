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
  app.get('/v1/game', [morkSessionMiddleware, userMiddleware], api.listGame);
  app.post('/v1/game', [morkSessionMiddleware, userMiddleware], api.addGame);
  app.post('/v1/post/:id', [morkSessionMiddleware, userMiddleware], api.postGame);
  app.post('/v1/comment/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.commentGame);
  app.get('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.getGameDetail);
  app.put('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.updateGame);
  app.delete('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.deleteGame);
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
    if (!req.session.user) {
        //if (process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined' && req.cookies['at'].length >10) {
        //    req.session.accessToken = req.cookies['at'];
        //    user.me(req, res, function(err, users){
        //        if(users) {
        //           next();
        //        }
        //    });
        //} else {
            return res.status(401).json({resCode:CODE.NO_LOGIN_ERROR.RESCODE, err:CODE.NO_LOGIN_ERROR.DESC});
        //}
    } else {
        next();
    }
}

