'use strict';
import fs from 'fs';
import config from 'config';
import CODE from '../lib/code';
import user from '../models/user';
import steem from '../models/steem';
import api from '../controllers/apiController';
import callback from '../controllers/callbackController';

module.exports = function(app) {
  app.all('*',function (req, res, next) {
      let allowedOrigins = config.get('steemit.app.allowedOrigins');
      let origin = req.headers.origin;
      res.header("Access-Control-Allow-Credentials", "true");
      if(allowedOrigins.indexOf(origin) > -1){
          res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

      if (req.method == 'OPTIONS') {
          res.send(200);
      }
      else {
          next();
      }
  });
  app.post('/v1/upload', [morkSessionMiddleware, userMiddleware], api.upload);
  app.get('/v1/game', [morkSessionMiddleware], api.listGame);
  app.post('/v1/game', [morkSessionMiddleware, userMiddleware], api.addGame);
  app.post('/v1/post', [morkSessionMiddleware, userMiddleware], api.postGame);
  app.get('/v1/game/:id', [], api.getGameDetail);
  app.put('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.updateGame);
  app.delete('/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.deleteGame);
  app.post('/v1/audit/:id', [morkSessionMiddleware, userMiddleware], api.auditGame);
  app.get('/v1/auditor', [morkSessionMiddleware, userMiddleware], api.listAuditor);
  app.delete('/v1/auditor/:account', [morkSessionMiddleware, userMiddleware], api.unsetAuditor);
  app.put('/v1/auditor/:account', [morkSessionMiddleware, userMiddleware], api.setAuditor);
  app.post('/v1/comment/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.commentGame);
  app.post('/v1/vote/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.voteGame);
  app.post('/v1/report/:id', [morkSessionMiddleware, userMiddleware], api.reportGame);
  app.get('/v1/me', [morkSessionMiddleware, userMiddleware], api.me);
  app.get('/v1/logout', api.logout);
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
                let userInfo = JSON.parse(result);
                try{
                    req.session.user = userInfo;
                    let result = await user.getUserToken("token:userid:"+userInfo.userid);
                    if(!result)
                    {
                        let refreshToken = await user.getUserToken("token:refresh:userid:"+userInfo.userid);
                        if(refreshToken) {
                            let refreshToken = await user.getUserToken("token:refresh:userid:"+userInfo.userid);
                            let ret = await steem.refreshToken(refreshToken.toString());
                            await user.setUserToken("token:userid:"+userInfo.userid, ret.access_token);
                            await user.setTokenExpire("token:userid:"+userInfo.userid, ret.expires_in);
                            await user.setUserToken("token:refresh:userid:"+userInfo.userid, ret.refresh_token);
                            req.session.accessToken = ret.access_token;
                        }
                    } else {
                        req.session.accessToken = result.toString();
                    }
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

