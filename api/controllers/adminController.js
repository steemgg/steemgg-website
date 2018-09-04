'use strict';

import user from '../models/user';
import steem from '../models/steem';
import game from '../models/game';
import config from 'config';
import querystring from 'querystring';
import CODE from '../lib/code';
import {SDKError} from '../errors/SDKError';
import {DBError} from '../errors/DBError';

exports.recommendGame = async function(req, res, next) {
    try{
        if (req.session.user.role != 2){
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        let unix = Math.round(+new Date()/1000);
        let data = req.body;
        let dbRes = null;
        let updateCloumns = ['recommend'];
        for(let attributename in data){
            if(updateCloumns.indexOf(attributename)<0) {
                delete data[attributename];
            }
        }
        data.lastModified = unix;
        dbRes = await game.updateGame([data, req.params.id, req.session.user.userid]);
        if (dbRes.changedRows == 1){
            return res.status(200).send();
        } else {
            return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
        }
    } catch(err) {
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.auditGame = async function(req, res, next) {
    try {
        let data = req.body;
        if (req.session.user.role === 0){
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        let dbRes = await game.getRecentlyActivity(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        let author = req.session.user.account;
        if(await user.getInterval('comment:interval:'+author)){
            return res.status(400).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        if(typeof data.status === 'undefined' ) {
            return res.status(400).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
        }
        let permlink = steem.createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
        let parentAuthor = dbRes[0].account;
        let parentPermlink = dbRes[0].permlink;
        await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, data.comment, permlink);
        await user.setInterval('comment:interval:'+author, config.get('steemit.app.commentInterval'));
        let unix = Math.round(+new Date()/1000);
        let audit = { userid:req.session.user.userid, account:req.session.user.account,gameid: req.params.id,lastModified: unix, permlink:permlink,comment:data.comment, type:1 };
        dbRes = await game.auditGame(audit, data.status);
        return res.status(200).json({comment:data.comment, parentAuthor:parentAuthor, parentPermlink:parentPermlink, author:author,permlink:permlink});
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
}

exports.listAuditor = async function(req, res, next) {
    try {
        let userInfo = req.session.user;
        if ( userInfo.role != 2) {
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        let dbRes = await user.getAuditor();
        return res.status(200).json({ auditors:dbRes });
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.unsetAuditor = async function(req, res, next) {
    try {
        let userInfo = req.session.user;
        if ( userInfo.role != 2) {
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        let dbRes = await user.updateAuditor([{'role':0}, req.params.account]);
        if (dbRes.changedRows == 1){
            return res.status(200).send();
        } else {
            return res.status(400).json({ resultCode: CODE.UNSET_AUDITOR_ERROR.RESCODE, err: CODE.UNSET_AUDITOR_ERROR.DESC });
        }
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.setAuditor = async function(req, res, next) {
    try {
        let userInfo = req.session.user;
        if ( userInfo.role != 2) {
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        let dbRes = await user.updateAuditor([{'role':1}, req.params.account]);
        if (dbRes.changedRows == 1){
            return res.status(200).send();
        } else {
            return res.status(400).json({ resultCode: CODE.SET_AUDITOR_ERROR.RESCODE, err: CODE.SET_AUDITOR_ERROR.DESC });
        }
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};
