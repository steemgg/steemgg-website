'use strict';
var fs = require('fs'),
    config = require('config'),
    CODE = require('../lib/code');

module.exports = function(app) {
  var api  = require('../controllers/apiController');

  app.post('/upload', [morkSessionMiddleware, userMiddleware], api.upload);
  app.post('/add', [morkSessionMiddleware, userMiddleware], api.addGame);
  app.get('/me', [morkMiddleware], api.me);
  app.get('/logout', api.logout);
  app.get('/', api.index);

  var callback  = require('../controllers/callbackController');
  app.get('/callback', callback.auth);
};

function morkMiddleware (req, res, next) {
    if (!req.session.accessToken && process.env.NODE_ENV === 'development') {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', function (err, result) {
            if (err) {
                console.log({resCode:CODE.TEST_DATA_ERROR.RESCODE, err:CODE.TEST_DATA_ERROR.DESC});
                next();
            } else {
                req.session.user = JSON.parse(result);
                res.status(200).json({resCode:CODE.SUCCESS.RESCODE, resData:JSON.parse(result)});
            }
        });
        return;
    }
    next();
}

function morkSessionMiddleware (req, res, next) {
    if (!req.session.accessToken && process.env.NODE_ENV === 'development') {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', function (err, result) {
            if (err) {
                console.log({resCode:CODE.TEST_DATA_ERROR.RESCODE, err:CODE.TEST_DATA_ERROR.DESC});
            } else {
                req.session.user = JSON.parse(result);
            }
            next();
        });
    } else {
        next();
    }
}

function userMiddleware (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({resCode:CODE.NO_LOGIN_ERROR.RESCODE, err:CODE.NO_LOGIN_ERROR.DESC});
    }
    next();
}
