'use strict';
import fs from 'fs';
import config from 'config';
import CODE from '../lib/code';
import user from '../models/user';
import steem from '../models/steem';
import api from '../controllers/apiController';
import admin from '../controllers/adminController';
import callback from '../controllers/callbackController';
import sdk from '../controllers/sdkController';

module.exports = function(app) {
  app.all('*',function (req, res, next) {
      let allowedOrigins = config.get('steemit.app.allowedOrigins');
      let origin = req.headers.origin;
      res.header("Access-Control-Allow-Credentials", "true");
      if(allowedOrigins.indexOf(origin) > -1){
          res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Cache-Control, Content-Type, Accept, Cookie');
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

      if (req.method == 'OPTIONS') {
          res.sendStatus(200);
      }
      else {
          next();
      }
  });
  app.post('/api/v1/upload', [morkSessionMiddleware, userMiddleware], api.upload);
  app.get('/api/v1/game', [morkSessionMiddleware], api.listGame);
  app.post('/api/v1/game', [morkSessionMiddleware, userMiddleware], api.addGame);
  app.post('/api/v1/post', [morkSessionMiddleware, userMiddleware], api.postGame);
  app.get('/api/v1/claimReward', [morkSessionMiddleware, userMiddleware], api.claimReward);
  app.get('/api/v1/game/:id', [morkSessionMiddleware], api.getGameDetail);
  app.put('/api/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.updateGame);
  app.delete('/api/v1/game/:id', [morkSessionMiddleware, userMiddleware], api.deleteGame);
  app.post('/api/v1/comment/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.commentGame);
  app.post('/api/v1/vote/:author/:permlink', [morkSessionMiddleware, userMiddleware], api.voteGame);
  app.post('/api/v1/report/:id', [morkSessionMiddleware, userMiddleware], api.reportGame);
  app.get('/api/v1/me', [morkSessionMiddleware, userMiddleware], api.me);
  app.get('/api/v1/logout', api.logout);
  app.get('/callback', callback.auth);
  app.get('/api/v1/leaderboard/:id', [morkSessionMiddleware, userMiddleware], api.leaderboard);

  app.post('/api/v1/audit/:id', [morkSessionMiddleware, userMiddleware], admin.auditGame);
  app.get('/api/v1/auditor', [morkSessionMiddleware, userMiddleware], admin.listAuditor);
  app.delete('/api/v1/auditor/:account', [morkSessionMiddleware, userMiddleware], admin.unsetAuditor);
  app.put('/api/v1/auditor/:account', [morkSessionMiddleware, userMiddleware], admin.setAuditor);
  app.put('/api/v1/recommend/:id', [morkSessionMiddleware, userMiddleware], admin.recommendGame);
  app.put('/sdk/v1/game/record/:id', [morkSessionMiddleware, userMiddleware], sdk.saveGame);
  app.get('/sdk/v1/game/record/:id', [morkSessionMiddleware, userMiddleware], sdk.loadGame);

  app.post('/sdk/v1/test/:id', sdk.test);
};

function morkSessionMiddleware (req, res, next) {
    if (process.env.NODE_ENV === 'development' && typeof req.cookies['at'] !== 'undefined') {
        fs.readFile( config.get('steemit.app.rooturl') + '/' + req.cookies['at'] +'.json', 'utf8', async function (err, result) {
            if (err) {
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

