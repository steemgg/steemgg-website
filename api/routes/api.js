'use strict';
import fs from 'fs';
import config from 'config';
import CODE from '../lib/code';
import user from '../models/user';
import redis from '../lib/redis';
import api from '../controllers/apiController';
import callback from '../controllers/callbackController';

module.exports = function(app) {
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
  app.get('/v1/me', [morkSessionMiddleware, userMiddleware], api.me);
  app.get('/v1/logout', api.logout);
  app.get('/v1/test', api.test);
  app.get('/testLogin', api.index);
  app.get('/callback', callback.auth);
};

function morkMiddleware (req, res, next) {
    if (process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined') {
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
    if (process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined') {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', async function (err, result) {
            if (err) {
                console.log({resCode:CODE.TEST_DATA_ERROR.RESCODE, err:CODE.TEST_DATA_ERROR.DESC});
                next();
            } else {
                let user = JSON.parse(result);
                try{
                    let result = await redis.instance.get("token:userid:"+user.userid);
                    req.session.user = user;
                    req.session.accessToken = result.toString();
                    next();
                } catch(err) {
                    console.error(err);
                    next();
                }
            }
        });
    } else {
        next();
    }
}

function userMiddleware (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({resCode:CODE.NEED_LOGIN_ERROR.RESCODE, err:CODE.NEED_LOGIN_ERROR.DESC});
    } else {
        next();
    }
}

