'use strict';

import fs from 'fs';
import path from 'path';
import url from 'url';
import util from 'util';
import config from 'config';
import ipfsAPI from 'ipfs-api';
import CODE from '../lib/code';
import decompress from 'decompress';
import formidable from 'formidable';
import user from '../models/user';
import steem from '../models/steem';
import game from '../models/game';
import querystring from 'querystring';
import {createPermlink} from '../vendor/steemitHelpers';
import {createCommentPermlink} from '../vendor/steemitHelpers';
import {SDKError} from '../errors/SDKError';
import {DBError} from '../errors/DBError';


exports.upload = function(req, res) {
    var userid = req.session.user.userid;
    var uploadDir = config.get('steemit.app.uploadurl');
    var form = new formidable.IncomingForm(),uploadStatus;
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;

    uploadStatus = true;
    form.on('fileBegin', function (name, file) {
        let fileType = file.type.split('/').pop();
        if(fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg' || fileType == 'gif' ){
            file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}.${fileType}`)
        } else if (fileType == 'zip') {
            file.path = path.join(uploadDir, '/zip/', `${new Date().getTime()}.zip`)
        } else {
            uploadStatus = false;
        }
    }).on('file', function(field, file) {
        if (uploadStatus) {
            let ipfs = ipfsAPI({host: config.get('steemit.ipfs.ip'), port: config.get('steemit.ipfs.port'), protocol: 'http'});
            if(file.type == 'application/zip') {
                unzipFile(file.path, userid, function cb(unzips){
                    ipfs.util.addFromFs(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path, { recursive: true }, (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC });
                        }
                        let data = result.slice(-1);
                        return res.status(200).json(result.slice(-1));
                    })
                });
            } else {
                ipfs.util.addFromFs(file.path, { recursive: true }, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC + err });
                    }
                    return res.status(200).json(result);
                })
            }
        } else {
            return res.status(500).json({ resCode:CODE.FILE_TYPE_ERROR.RESCODE, err: CODE.FILE_TYPE_ERROR.DESC });
        }
    });
    form.parse(req);
};

exports.me = async function(req, res) {
    try {
        let userInfo = req.session.user;
        userInfo.gamePostingInterval = config.get('steemit.app.gamePostingInterval');
        return res.status(200).json(userInfo);
    } catch(err) {
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.postGame = async function(req, res, next) {
    try{
        let data = req.body;
        let userInfo = req.session.user;
        let dbRes = await game.getGameById(data.gameid);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        if(userInfo.account != dbRes[0]['account'] || data.gameid != dbRes[0]['id']) {
            return res.status(500).json({ resultCode: CODE.PARAMS_INCONSISTENT_ERROR.RESCODE, err: CODE.PARAMS_INCONSISTENT_ERROR.DESC });
        }
        let gameTTL = await user.getTTL('post:interval:game:'+data.gameid+':'+userInfo.userid);
        if( gameTTL>0 ){
            return res.status(500).json({ resultCode: CODE.POST_INTERVAL_ERROR.RESCODE, err: CODE.POST_INTERVAL_ERROR.DESC, ttl:gameTTL });
        }
        let postTTL = await user.getTTL('post:interval:'+userInfo.userid);
        if( postTTL>0 ){
            return res.status(500).json({ resultCode: CODE.POST_INTERVAL_ERROR.RESCODE, err: CODE.POST_INTERVAL_ERROR.DESC, ttl:postTTL });
        }
        let author = req.session.user.account;
        let permLink = await createPermlink(data.activityTitle, author, '', '');
        let result = await steem.post(req.session.accessToken, author, data.activityTitle, data.activityDescription, data.reward, data.tags,permLink);
        let unix = Math.round(+new Date()/1000);
        let activity = {userid:req.session.user.userid, account:req.session.user.account,gameid: data.gameid,lastModified: unix, permlink:permLink };
        await game.addActivity(activity);
        await game.updateActivityCount([data.gameid,req.session.user.userid]);
        let iso = new Date(unix*1000).toISOString();
        await user.setInterval('post:interval:'+userInfo.userid, config.get('steemit.app.postingInterval'));
        await user.setInterval('post:interval:game:'+data.gameid+':'+userInfo.userid, config.get('steemit.app.gamePostingInterval'));
        activity.lastModified = iso;
        return res.status(200).json(activity);
    } catch(err) {
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

exports.addGame = async function(req, res, next) {
    try{
        let userInfo = req.session.user;
        let data = req.body;
        let unix = Math.round(+new Date()/1000);
        let gameInfo = {userid:userInfo.userid,account:userInfo.account,created:unix,lastModified:unix,gameUrl:data.gameUrl,coverImage:data.coverImage,version:data.version,title:data.title,category:data.category,description:data.description};
        let dbRes = await game.addGame(gameInfo);
        let iso = new Date(unix*1000).toISOString();
        gameInfo.id = dbRes.insertId;
        gameInfo.lastModified = iso;
        gameInfo.created = iso;
        return res.status(200).json(gameInfo);
    } catch(err) {
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.commentGame = async function(req, res, next) {
    try{
        let userInfo = req.session.user;
        if(await user.getInterval('comment:interval:'+userInfo.account)){
            return res.status(500).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        let post = req.body;
        let author = req.session.user.account;
        let permlink = createCommentPermlink(req.params.author,req.params.permlink);
        await steem.comment(req.session.accessToken, req.params.author,req.params.permlink, author, post.content, permlink);
        await user.setInterval('comment:interval:'+userInfo.account, config.get('steemit.app.commentInterval'));
        return res.status(200).json({content:post.content, author:author, permlink:permlink});
    } catch(err) {
        console.error(err);
        if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.getGameDetail = async function(req, res, next) {
    try{
        let dbRes = await game.getGameById(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        let steemitRes = await game.getActivitiesById(req.params.id);
        if(steemitRes.length>0){
            dbRes[0]['activities'] = steemitRes;
        }
        let reportComments = await game.reportComments(req.params.id);
        if(reportComments.length>0){
            dbRes[0]['reportComments'] = reportComments;
        }
        let auditComments = await game.auditComments(req.params.id);
        if(auditComments.length>0){
            dbRes[0]['auditComments'] = auditComments;
        }
        return res.status(200).json(dbRes[0]);
    } catch(err) {
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.updateGame = async function(req, res, next) {
    try{
        let unix = Math.round(+new Date()/1000);
        let data = req.body;
        let dbRes = await game.updateGame([{ title:data.title,coverImage:data.coverImage,description:data.description,category:data.category,gameUrl:data.gameUrl,lastModified:unix }, req.params.id, req.session.user.userid]);
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

exports.deleteGame = async function(req, res, next) {
    try{
        let dbRes = await game.deleteGame([req.params.id, req.session.user.userid]);
        if (dbRes.changedRows == 1){
            return res.status(200).send();
        } else {
            return res.status(500).json({ resultCode: CODE.DELETE_GAME_ERROR.RESCODE, err: CODE.DELETE_GAME_ERROR.DESC } );
        }
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.listGame = async function(req, res, next) {
    try {
        let data = req.body;
        let keys = {};
        let offset = keys['offset'] = (typeof req.query.offset !== 'undefined') ?  parseInt(req.query.offset,10) : 0;
        let pageSize = keys['pageSize'] = (typeof req.query.limit !== 'undefined') ? parseInt(req.query.limit, 10) : 20;
        let category = keys['category'] = (typeof req.query.category !== 'undefined') ? req.query.category : '';
        let creator = keys['account'] = (typeof req.query.creator !== 'undefined') ? req.query.creator : '';
        let report = keys['report'] = (typeof req.query.report !== 'undefined') ?  parseInt(req.query.report,10) : '';
        let status = keys['status'] = (typeof req.query.status !== 'undefined') ? parseInt(req.query.status, 10) : 1;
        let recommend = keys['recommend'] = (typeof req.query.recommend !== 'undefined') ? parseInt(req.query.recommend, 10) : '';
        let sort = keys['sort'] = (typeof req.query.sort !== 'undefined') ? req.query.sort : 'created_desc';
        let includeComment = (typeof req.query.includeComment !== 'undefined') ? req.query.includeComment : false;
        let sortArr = sort.split("_")
        let currUrl = querystring.stringify({ offset: offset, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], creator:creator, status:status, report:report, recommend:recommend,includeComment:includeComment });
        let nextUrl = querystring.stringify({ offset: offset+pageSize, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], creator:creator, status:status, report:report });
        let gameQuery = '';
        keys['status'] = 1;
        if (typeof req.session.user !== 'undefined') {
            let user = req.session.user;
            if (user.role == 1 || user.role == 2 || creator === user.account) {
                keys['status'] = status;
            }
        }

        let path = url.parse(req.url).pathname;
        let href = path +'?' + currUrl;
        let dbRes = await game.countOfGames(keys);
        let count = dbRes[0]['nums'];
        if(count>0) {
            let dbRes = await game.gameList(keys);
            if(includeComment){
                for(let k in dbRes){
                    let reportComments = await game.reportComments(dbRes[k]['id']);
                    if(reportComments.length>0){
                        dbRes[k]['reportComments'] = reportComments;
                    }
                    let auditComments = await game.auditComments(dbRes[k]['id']);
                    if(auditComments.length>0){
                        dbRes[k]['auditComments'] = auditComments;
                    }
                }
            }
            let next = '';
            if (count>=(offset+pageSize)) {
                next = path+ '?'+ nextUrl;
            }
            return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
        } else {
            return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count });
        }
    } catch(err){
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

exports.voteGame = async function(req, res, next) {
    try{
        let data = req.body;
        let voter = req.session.user.account;
        if(await user.getInterval('vote:interval:'+voter)){
            return res.status(500).json({ resultCode: CODE.VOTE_INTERVAL_ERROR.RESCODE, err: CODE.VOTE_INTERVAL_ERROR.DESC });
        }
        let author = req.params.author;
        let permlink = req.params.permlink;
        if( typeof voter === 'undefined' || typeof author === 'undefined' || typeof author === 'undefined' || typeof data.weight ==='undefined' ){
            return res.status(500).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
        }
        await steem.vote(req.session.accessToken, voter, author, permlink, parseInt(data.weight));
        await user.setInterval('vote:interval:'+voter, config.get('steemit.app.voteInterval'));
        return res.status(200).json({author:author,permlink:permlink,weight:parseInt(data.weight)});
    } catch(err) {
        console.error(err);
        if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
}

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
            return res.status(500).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        if(typeof data.status === 'undefined' ) {
            return res.status(500).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
        }
        let permlink = createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
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

exports.reportGame = async function(req, res, next) {
    try {
        let data = req.body;
        let reportStatus = data.report;
        let author = req.session.user.account;
        if(await user.getInterval('comment:interval:'+author)){
            return res.status(500).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        let dbRes = await game.canReportGame([req.params.id]);
        if(typeof dbRes[0] !== 'undefined') {
            if(reportStatus  == 1) {
                return res.status(500).json({ resultCode: CODE.HAS_REPORT_ERROR.RESCODE, err: CODE.HAS_REPORT_ERROR.DESC });
            } else {
                await game.unreportGame(req.params.id);
                return res.status(200).json();
            }
        } else {
            if(reportStatus  == 0) {
                return res.status(500).json({ resultCode: CODE.NO_REPORT_ERROR.RESCODE, err: CODE.NO_REPORT_ERROR.DESC });
            }
        }
        dbRes = await game.getRecentlyActivity(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        let permlink = createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
        let parentAuthor = dbRes[0].account;
        let parentPermlink = dbRes[0].permlink;
        await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, data.comment, permlink);
        await user.setInterval('comment:interval:'+author, config.get('steemit.app.commentInterval'));
        let unix = Math.round(+new Date()/1000);
        let report = { userid:req.session.user.userid, account:req.session.user.account,gameid: req.params.id,lastModified: unix, permlink:permlink,comment:data.comment };
        dbRes = await game.reportGame(report);
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

exports.logout = async function(req, res, next) {
    try{
        if (process.env.NODE_ENV !== 'development'){
            await steem.revokeToken(req.session.accessToken);
        }
        res.clearCookie('at');
        req.session.destroy(function(err) {
            if(err){
                return res.status(500).json({ resultCode: CODE.CLEAR_SESSION_ERROR.RESCODE, err: CODE.CLEAR_SESSION_ERROR.DESC });
            }
        });
        res.status(200).send();
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

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb(files);
    });
}

