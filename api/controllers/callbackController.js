'use strict';

import CODE from '../lib/code';
import user from '../models/user';
import steem from '../models/steem';

exports.auth = async function(req, res, next) {
    try {
    if (typeof req.query.access_token === 'undefined') {
        return res.status(401).json({resCode:CODE.NEED_LOGIN_ERROR.RESCODE, err:CODE.NEED_LOGIN_ERROR.DESC});
    }

    let state =  (typeof req.query.state !== 'undefined') ?  req.query.state : '';
    let result = await steem.me(req.query.access_token);
    let dbRes = await user.getUserByAccount(result.user);
    let unix = Math.round(+new Date()/1000);
    let userInfo = dbRes[0];
    if(typeof userInfo === 'undefined') {
        userInfo = {'account':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'created':unix};
        await user.addUser(userInfo);
        let iso = new Date(userInfo['created']*1000).toISOString();
        userInfo.created = iso;
    }
    await user.setUserToken("token:userid:"+userInfo.userid, req.query.access_token);
    req.session.accessToken = req.query.access_token;
    req.session.user = userInfo;
    res.redirect(state);
    } catch(err) {
        console.error(err);
        return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
    }
};

