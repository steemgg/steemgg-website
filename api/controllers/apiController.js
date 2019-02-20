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
import {SDKError} from '../errors/SDKError';
import {DBError} from '../errors/DBError';


exports.upload = function(req, res) {
    let userid = req.session.user.userid;
    let uploadDir = config.get('steemit.app.uploadurl');
    let form = new formidable.IncomingForm(),uploadStatus;
    let zipMineTypes = ['zip', 'octet-stream','x-zip','x-zip-compressed','zip-compressed'];
    let errInfo = '';
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;

    uploadStatus = 1;
    form.on('error', function(err) {
        errInfo = err.toString();
        if(errInfo.indexOf("maxFileSize")>0) {
            uploadStatus = 3;
        } else {
            uploadStatus = 4;
        }
    }).on('fileBegin', function (name, file) {
        let fileType = file.type.split('/').pop();
        if(fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg' || fileType == 'gif' ){
            form.maxFileSize = config.get('steemit.app.maxImgUploadSize') * 1024 * 1024;
            file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}_${req.session.user.account}.${fileType}`)
        } else if (zipMineTypes.indexOf(fileType)>=0) {
            form.maxFileSize = config.get('steemit.app.maxUploadSize') * 1024 * 1024;
            file.path = path.join(uploadDir, '/zip/', `${new Date().getTime()}_${req.session.user.account}.zip`)
        } else {
            uploadStatus = 2;
        }
    }).on('file', function(field, file) {
        if (uploadStatus == 1) {
            let fileType = file.type.split('/').pop();
            let ipfs = ipfsAPI({host: config.get('steemit.ipfs.ip'), port: config.get('steemit.ipfs.port'), protocol: 'http'});
            if(zipMineTypes.indexOf(fileType)>=0) {
                unzipFile(file.path, userid, function cb(err,unzips){
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
                    }
                    let isDirectory = false;
                    let uploadPath = config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path;
                    for(let i=unzips.length-1;i>=0;i--) {
                        if(unzips[i].path == "index.html") {
                            isDirectory = true;
                        }
                        if(/\//.test(unzips[i].path)){
                            let directorys = unzips[i].path.split(/\//);
                            let rootPath = directorys.slice(0, 1);
                            uploadPath = config.get('steemit.app.gameurl')+"/"+userid+"/"+rootPath;
                        }
                    }
                    if (isDirectory == true) {
                        let tmpPath = config.get('steemit.app.gameurl')+"/"+userid+"/"+new Date().getTime()+"/";
                        !fs.existsSync(tmpPath) && fs.mkdirSync(tmpPath);
                        for(let i=0;i<unzips.length;i++) {
                            if (unzips[i].type == "file") {
                                if(/\//.test(unzips[i].path)){
                                    let directorys = unzips[i].path.split(/\//);
                                    for(let j=1; j<directorys.length; j++) {
                                        let segment = directorys.slice(0, j).join('/');
                                        !fs.existsSync(tmpPath+segment) && fs.mkdirSync(tmpPath+segment);
                                    }
                                }
                                fs.renameSync(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[i].path,tmpPath+unzips[i].path);
                            }
                        }
                        uploadPath = tmpPath;
                    }
                    ipfs.util.addFromFs(uploadPath, { recursive: true }, (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ resultCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC });
                        }
                        let data = result.slice(-1);
                        return res.status(200).json(result.slice(-1));
                    })
                });
            } else {
                ipfs.util.addFromFs(file.path, { recursive: true }, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ resultCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC + err });
                    }
                    return res.status(200).json(result);
                })
            }
        } else if(uploadStatus == 2){
            return res.status(500).json({ resultCode:CODE.FILE_TYPE_ERROR.RESCODE, err: CODE.FILE_TYPE_ERROR.DESC });
        } else if(uploadStatus == 3){
            return res.status(500).json({ resultCode:CODE.FILE_MAX_SIZE_ERROR.RESCODE, err: CODE.FILE_MAX_SIZE_ERROR.DESC });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err: errInfo });
        }
    });
    form.parse(req);
};

exports.me = async function(req, res) {
    try {
        let userInfo = req.session.user;
        console.log(userInfo);
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
            return res.status(400).json({ resultCode: CODE.PARAMS_INCONSISTENT_ERROR.RESCODE, err: CODE.PARAMS_INCONSISTENT_ERROR.DESC });
        }
        let gameTTL = await user.getTTL('post:interval:game:'+data.gameid+':'+userInfo.userid);
        if( gameTTL>0 ){
            return res.status(400).json({ resultCode: CODE.POST_INTERVAL_ERROR.RESCODE, err: CODE.POST_INTERVAL_ERROR.DESC, ttl:gameTTL });
        }
        let postTTL = await user.getTTL('post:interval:'+userInfo.userid);
        if( postTTL>0 ){
            return res.status(400).json({ resultCode: CODE.POST_INTERVAL_ERROR.RESCODE, err: CODE.POST_INTERVAL_ERROR.DESC, ttl:postTTL });
        }
        let tag = config.get('steemit.sc.tag')
        let tags = data.tags;
        if(!tags.includes(tag) || tags.indexOf(tag)>5){
            tags.unshift(tag);
        }
        for(let i=tags.length;i>5;i--) {
            tags.pop();
        }
        let coverImage = JSON.parse(dbRes[0]['coverImage']);
        let author = req.session.user.account;
        let permLink = steem.createPermlink(data.activityTitle, author);
        let content = '[<img src="https://ipfs.io/ipfs/'+coverImage.hash+'" />](https://steemgg.com/#/game/play/'+data.gameid+')  \n\n' +
                    '['+dbRes[0]['title']+'](https://steemgg.com/#/game/play/'+data.gameid+')' +  '\n\n' +
                    data.activityDescription + '\n\n' +
                    '---\n' +
                    'Posted on [SteemGG - STEEM Blockchain Based HTML5 Gaming Platform](https://steemgg.com/#/game/play/'+data.gameid+')\n';
        let type = 1;
        if (dbRes[0]['activities']>0 && !data.post) {
            type = 2;
            content = '[<img src="https://ipfs.io/ipfs/'+coverImage.hash+'" />](https://steemgg.com/#/game/play/'+data.gameid+')  \n\n' +
                    '['+data.activityTitle+'](https://steemgg.com/#/game/play/'+data.gameid+')' +  '\n\n' +
                    data.activityDescription + '\n\n' +
                    '---\n' +
                    'Posted on [SteemGG - STEEM Blockchain Based HTML5 Gaming Platform](https://steemgg.com/#/game/play/'+data.gameid+')\n';
            let recentlyActivity = await game.getRecentlyActivity(data.gameid);
            permLink = steem.createCommentPermlink(recentlyActivity[0].account,recentlyActivity[0].permlink);
            let parentAuthor = recentlyActivity[0].account;
            let parentPermlink = recentlyActivity[0].permlink;
            await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, content, permLink, tag);
        } else {
            await steem.post(req.session.accessToken, author, data.activityTitle, content, data.reward, tags, permLink, tag);
        }

        let unix = Math.round(+new Date()/1000);
        let activity = {userid:req.session.user.userid, account:req.session.user.account,gameid: data.gameid,lastModified: unix, permlink:permLink,activityTitle:data.activityTitle, type:type };
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
        let gameInfo = {userid:userInfo.userid,account:userInfo.account,created:unix,lastModified:unix,gameUrl:data.gameUrl,coverImage:data.coverImage,version:data.version,title:data.title,category:data.category,description:data.description,width:data.width,height:data.height,key:data.key,privatekey:Math.random().toString(36).substring(2)};
        let dbRes = await game.addGame(gameInfo);
        let iso = new Date(unix*1000).toISOString();
        gameInfo.id = dbRes.insertId;
        gameInfo.lastModified = iso;
        gameInfo.created = iso;
        delete gameInfo.privatekey;
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
            return res.status(400).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        let post = req.body;
        let author = req.session.user.account;
        let permlink = steem.createCommentPermlink(req.params.author,req.params.permlink);
        let tag = config.get('steemit.sc.tag')
        await steem.comment(req.session.accessToken, req.params.author,req.params.permlink, author, post.content, permlink, tag);
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
        let userInfo = req.session.user;
        console.log(userInfo);
        if(userInfo) {
            if (userInfo.account !== dbRes[0]['account']) {
                delete dbRes[0]['key'];
            }
        } else {
            delete dbRes[0]['key'];
        }
        delete dbRes[0]['privatekey'];
        if(dbRes[0]['status']!=1) {
            if (typeof req.session.user == 'undefined') {
                return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
            } else {
                if (userInfo.account !== dbRes[0]['account']) {
                    if( userInfo.role == 0 ) {
                        return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
                    }
                }
            }
        }

        let steemitRes = await game.getActivitiesByGameId(req.params.id);
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
        let updateCloumns = ['title','coverImage','description','category','version','gameUrl','width','height','key'];
        let dbRes = null;
        for(let attributename in data){
            if(updateCloumns.indexOf(attributename)<0) {
                delete data[attributename];
            }
        }
        data.lastModified = unix;
        dbRes = await game.updateGameSelf([data, req.params.id, req.session.user.userid]);
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
        let userInfo = req.session.user;
        let dbRes = null;
        if (userInfo.role == 2) {
            dbRes = await game.deleteGameByAdmin([req.params.id]);
        } else {
            dbRes = await game.deleteGame([req.params.id, req.session.user.userid]);
        }
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
            let userInfo = req.session.user;
            if (userInfo.role == 1 || userInfo.role == 2 || creator === userInfo.account) {
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
        console.log(req.session.accessToken)
        let data = req.body;
        let voter = req.session.user.account;
        if(await user.getInterval('vote:interval:'+voter)){
            return res.status(400).json({ resultCode: CODE.VOTE_INTERVAL_ERROR.RESCODE, err: CODE.VOTE_INTERVAL_ERROR.DESC });
        }
        let author = req.params.author;
        let permlink = req.params.permlink;
        if( typeof voter === 'undefined' || typeof author === 'undefined' || typeof author === 'undefined' || typeof data.weight ==='undefined' ){
            return res.status(400).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
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

exports.reportGame = async function(req, res, next) {
    try {
        let data = req.body;
        let reportStatus = data.report;
        let author = req.session.user.account;
        if(await user.getInterval('comment:interval:'+author)){
            return res.status(400).json({ resultCode: CODE.COMMENT_INTERVAL_ERROR.RESCODE, err: CODE.COMMENT_INTERVAL_ERROR.DESC });
        }
        let dbRes = await game.canReportGame([req.params.id]);
        if(typeof dbRes[0] !== 'undefined') {
            if(reportStatus  == 1) {
                return res.status(400).json({ resultCode: CODE.HAS_REPORT_ERROR.RESCODE, err: CODE.HAS_REPORT_ERROR.DESC });
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
        let permlink = steem.createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
        let parentAuthor = dbRes[0].account;
        let parentPermlink = dbRes[0].permlink;
        let tag = config.get('steemit.sc.tag')
        await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, data.comment, permlink, tag);
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

exports.claimReward = async function(req, res) {
    try {
        let rewardSteem = (typeof req.query.rewardSteem !== 'undefined') ? req.query.rewardSteem : '0.000 STEEM';
        let rewardSbd = (typeof req.query.rewardSbd !== 'undefined') ? req.query.rewardSbd : '0.000 SBD';
        let rewardVest = (typeof req.query.rewardVest !== 'undefined') ? req.query.rewardVest : '0.000000 VESTS';
        let userInfo = req.session.user;
        console.log(userInfo,req.session.accessToken);
        let result = await steem.claimRewardBalance(req.session.accessToken, userInfo.account, rewardSteem, rewardSbd, rewardVest);
        return res.status(200).json(result);
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

exports.leaderboard = async function(req, res) {
    try {
        let rank = (typeof req.query.rank !== 'undefined') ? req.query.rank : 'score';
        let start = (typeof req.query.start !== 'undefined') ? req.query.start : 0;
        let end = (typeof req.query.end !== 'undefined') ? req.query.end : 50;
        let result = await game.getRanks(req.params.id, rank, start, end);
        console.log(result);
        return res.status(200).json(result);
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

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb('',files);
    }).catch(function (error) {
        cb(error);
    });
}

