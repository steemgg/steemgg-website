'use strict';

import CODE from '../lib/code';
import user from '../models/user';
import steem from '../models/steem';
import config from 'config';

exports.auth = async function(req, res, next) {
    try {
        let access_token = req.query.access_token;
        let state =  (typeof req.query.state !== 'undefined') ?  req.query.state : '';
        let result = await steem.me(access_token);
        let dbRes = await user.getUserByAccount(result.user);
        let unix = Math.round(+new Date()/1000);
        let userInfo = dbRes[0];
        if(typeof userInfo === 'undefined') {
            userInfo = {'account':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'created':unix};
            await user.addUser(userInfo);
            let iso = new Date(userInfo['created']*1000).toISOString();
            userInfo.created = iso;
        }
        if (config.get('steemit.app.saveToken')){
            await user.setUserToken("token:userid:"+userInfo.userid, access_token);
            await user.setTokenExpire("token:userid:"+userInfo.userid, 86400*7);
            if(typeof refresh_token !== 'undefined') {
                await user.setUserToken("token:refresh:userid:"+userInfo.userid, refresh_token);
            }
        }
        req.session.accessToken = access_token;
        req.session.user = userInfo;
        res.redirect(state);
    } catch(err) {
        console.error(err);
        return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
    }
};

