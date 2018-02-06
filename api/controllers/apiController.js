'use strict';

import fs from 'fs';
import path from 'path';
import util from 'util';
import config from 'config';
import ipfsAPI from 'ipfs-api';
import CODE from '../lib/code';
import decompress from 'decompress';
import formidable from 'formidable';
import user from '../models/user';
import steem from '../models/steem';
import game from '../models/game';
import redis from 'redis';
import querystring from 'querystring';
import {createPermlink} from '../vendor/steemitHelpers';
import {createCommentPermlink} from '../vendor/steemitHelpers';
import {SDKError} from '../errors/SDKError';
import {DBError} from '../errors/DBError';

const client = redis.createClient({host: config.get('steemit.redis.host'), port:config.get('steemit.redis.port')});

exports.upload = function(req, res) {
    var userid = req.session.user.userid;
    var uploadDir = config.get('steemit.app.uploadurl');
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, function(err, fields, files) {
        if (err || !files['file']){
            console.log(err);
            return res.status(500).json({ resCode:CODE.FILE_UPLOAD_ERROR.RESCODE, err: CODE.FILE_UPLOAD_ERROR.DESC });
        }
        var ipfs = ipfsAPI({host: config.get('steemit.ipfs.ip'), port: config.get('steemit.ipfs.port'), protocol: 'http'});
        if(files['file'].type == 'application/zip') {
            unzipFile(files['file'].path, userid, function cb(unzips){
                ipfs.util.addFromFs(config.get('steemit.app.gameurl')+"/"+userid+"/"+unzips[0].path, { recursive: true }, (err, result) => {
                    if (err) {
                        return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC });
                    }
                    res.status(200).json(result.slice(-1));
                })
            });
        } else {
            ipfs.util.addFromFs(files['file'].path, { recursive: true }, (err, result) => {
                if (err) {
                    return res.status(500).json({ resCode:CODE.IPFS_ERROR.RESCODE, err: CODE.IPFS_ERROR.DESC + err });
                }
                res.status(200).json(result);
            })
        }
    })
    form.on('fileBegin', function (name, file) {
        const fileExt = path.extname(file.name);
        file.path = path.join(uploadDir, '/image/', `${new Date().getTime()}${fileExt}`)
        if(file.type == 'application/zip') {
            file.path = path.join(uploadDir, '/zip/', `${new Date().getTime()}.zip`)
        }
    })
};

exports.me = async function(req, res) {
    try {
        let result = await steem.me(req.session.accessToken);
        let dbRes = await user.getUserByAccount(result.user);
        let userInfo = dbRes[0];
        if(typeof userInfo === 'undefined') {
            userInfo = {'account':result.user, 'userid':result.account.id, 'role':0, 'status':1, 'createtime':Math.round(+new Date()/1000)};
            await user.addUser(userInfo);
        }
        req.session.user = userInfo;
        client.set("token:userid:"+userInfo.userid, req.session.accessToken);
        return res.status(200).json(userInfo);
    } catch(err) {
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.postGame = async function(req, res, next) {
    let data = req.body;
    let userInfo = req.session.user;
    try{
        let dbRes = await game.getGameById(data.gameid);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        if(userInfo.account != dbRes[0]['account'] || data.gameid != dbRes[0]['id']) {
            return res.status(500).json({ resultCode: CODE.PARAMS_INCONSISTENT_ERROR.RESCODE, err: CODE.PARAMS_INCONSISTENT_ERROR.DESC });
        }
        let author = req.session.user.account;
        let permLink = await createPermlink(data.activityTitle, author, '', '');
        let result = await steem.post(req.session.accessToken, author, data.activityTitle, data.activityDescription, data.reward, data.tags,permLink);
        let unix = Math.round(+new Date()/1000);
        let activity = {userid:req.session.user.userid, account:req.session.user.account,gameid: data.gameid,lastModified: unix, permlink:permLink };
        await game.addActivity(activity);
        return res.status(200).json(activity);
    } catch(err) {
        console.log(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
}

exports.addGame = async function(req, res, next) {
    let userInfo = req.session.user;
    let data = req.body;
    let unix = Math.round(+new Date()/1000);
    let gameInfo = {userid:userInfo.userid,account:userInfo.account,created:unix,lastModified:unix,gameUrl:data.gameUrl,coverImage:data.coverImage,version:data.version,title:data.title,category:data.category,description:data.description};

    try{
        let dbRes = await game.addGame(gameInfo);
        gameInfo.id = dbRes.insertId;
        return res.status(200).json(gameInfo);
    } catch(err) {
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.commentGame = async function(req, res, next) {
    let userInfo = req.session.user;
    let post = req.body;
    let author = req.session.user.account;
    let permlink = createCommentPermlink(req.params.author,req.params.permlink);
    try{
        await steem.comment(req.session.accessToken, req.params.author,req.params.permlink, author, post.content, permlink);
        return res.status(200).json({content:post.content, author:req.params.author, permlink:req.params.permlink});
    } catch(err) {
        if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
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
        return res.status(200).json(dbRes[0]);
    } catch(err) {
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};
exports.updateGame = async function(req, res, next) {
    let unix = Math.round(+new Date()/1000);
    let data = req.body;
    try{
        let dbRes = await game.updateGame([{ title:data.title,coverImage:data.coverImage,description:data.description,category:data.category,gameUrl:data.gameUrl,lastModified:unix }, req.params.id, req.session.user.userid]);
        if (dbRes.changedRows == 1){
            return res.status(200).send();
        } else {
            return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
        }
    } catch(err) {
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
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
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.listGame = async function(req, res, next) {
    let data = req.body;
    let offset = (typeof req.query.offset !== 'undefined') ?  parseInt(req.query.offset,10) : 0;
    let pageSize = (typeof req.query.limit !== 'undefined') ? parseInt(req.query.limit, 10) : 20;
    let category = (typeof req.query.category !== 'undefined') ? req.query.category : '';
    let sort = (typeof req.query.sort !== 'undefined') ? req.query.sort : 'created_desc';
    let sortArr = sort.split("_")
    let type = (typeof req.query.type !== 'undefined') ? req.query.type : 'index';
    let url = querystring.stringify({ offset: offset, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], type:type });
    let nextUrl = querystring.stringify({ offset: offset+pageSize, pageSize: pageSize, category: category, sort:sortArr[1], column:sortArr[0], type:type });
    let userid = req.session.user.userid;
    let gameQuery = 'status = 1';
    if (type === 'me'){
        gameQuery = 'status != 3 and userid='+ userid;
        if (typeof userid === 'undefined') {
            return res.status(401).json({resCode:CODE.NEED_LOGIN_ERROR.RESCODE, err:CODE.NEED_LOGIN_ERROR.DESC});
        }
    } else if(type ==='audit') {
        if (req.session.user.role === 0){
            return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
        }
        gameQuery = 'status = 0';
    }
    if (category !='') {
        gameQuery = 'and category='+category;
    }
    let countSql = 'select count(1) as nums from games where ' + gameQuery;
    let querySql = 'select * from games where ' + gameQuery + ' order by ? ? limit ?,?';
    let queryParams = [sortArr[0], sortArr[1], offset, pageSize];
    let href = 'game?' + url;
    try {
        let dbRes = await game.query(countSql, []);
        let count = dbRes[0]['nums'];
        if(count>0) {
            let dbRes = await game.query(querySql, queryParams);
            let next = '';
            if (count>=(offset+pageSize)) {
                next = 'game?'+ nextUrl;
            }
            return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:dbRes,totalCount:count });
        } else {
            return res.status(200).json({ offset:offset,limit:pageSize,next:next,href:href,items:[],totalCount:count });
        }
    } catch(err){
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.voteGame = async function(req, res, next) {
    let data = req.body;
    let voter = req.session.user.account;
    let author = req.params.author;
    let permlink = req.params.permlink;
    if( typeof voter === 'undefined' || typeof author === 'undefined' || typeof author === 'undefined' || typeof data.weight ==='undefined' ){
        return res.status(500).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
    }
    try{
        await steem.vote(req.session.accessToken, voter, author, permlink, parseInt(data.weight));
        return res.status(200).json({author:authr,permlink:permlink,weight:parseInt(data.weight)});
    } catch(err) {
        if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
}

exports.auditGame = async function(req, res, next) {
    let data = req.body;
    if (req.session.user.role === 0){
        return res.status(401).json({ resultCode: CODE.PERMISSION_DENIED_ERROR.RESCODE, err: CODE.PERMISSION_DENIED_ERROR.DESC });
    }
    try {
        let dbRes = await game.getRecentlyActivity(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        let author = req.session.user.account;
        let permlink = createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
        let parentAuthor = dbRes[0].account;
        let parentPermlink = dbRes[0].permlink;
        await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, data.comment, permlink);
        dbRes = await game.auditGame([data.status,req.params.id]);
        if (dbRes.changedRows == 1){
            return res.status(200).json({comment:data.comment, parentAuthor:parentAuthor, parentPermlink:parentPermlink, author:author,permlink:permlink});
        } else {
            return res.status(500).json({ resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC });
        }
    } catch(err){
        console.log(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
}

exports.reportGame = async function(req, res, next) {
    let data = req.body;
    try {
        let dbRes = await game.getRecentlyActivity(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_ACTIVITY_ERROR.RESCODE, err: CODE.NOFOUND_ACTIVITY_ERROR.DESC });
        }
        let author = req.session.user.account;
        let permlink = createCommentPermlink(dbRes[0].account,dbRes[0].permlink);
        let parentAuthor = dbRes[0].account;
        let parentPermlink = dbRes[0].permlink;
        await steem.comment(req.session.accessToken, parentAuthor, parentPermlink, author, data.comment, permlink);
        dbRes = await game.reportGame([data.report,req.params.id]);
        if (dbRes.changedRows == 1){
            return res.status(200).json({comment:data.comment, parentAuthor:parentAuthor, parentPermlink:parentPermlink, author:author,permlink:permlink});
        } else {
            return res.status(500).json({resultCode: CODE.UPDATE_GAME_ERROR.RESCODE, err: CODE.UPDATE_GAME_ERROR.DESC});
        }
    } catch(err){
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
}

exports.index = async function(req, res, next) {
    try{
        let url = await steem.getLoginUrl();
        res.render('index', { title: '$$$ hello! Steem Game $$$', login: url });
    } catch(err){
        console.log(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.logout = async function(req, res, next) {
    try{
        await steem.revokeToken(req.session.accessToken);
        res.clearCookie('at');
        req.session.destroy(function(err) {
            if(err){
                return res.status(500).json({ resultCode: CODE.CLEAR_SESSION_ERROR.RESCODE, err: CODE.CLEAR_SESSION_ERROR.DESC });
            }
        });
        res.status(200).send();
    } catch(err){
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else if (err instanceof SDKError) {
            return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
        }
    }
};

exports.voteGame = async function(req, res, next) {
    let data = req.body;
    let voter = req.session.user.account;
    let author = req.params.author;
    let permlink = req.params.permlink;
    if (process.env.NODE_ENV === 'development' && voter ==='apple') {
        voter = 'steemitgame.test';
    }
    //console.log(voter,author,permlink,data.weight);
    if( typeof voter === 'undefined' || typeof author === 'undefined' || typeof author === 'undefined' || typeof data.weight ==='undefined' ){
        return res.status(500).json({ resultCode: CODE.PARAMS_ERROR.RESCODE, err: CODE.PARAMS_ERROR.DESC });
    }
    steem.vote(req.session.accessToken, voter, author, permlink, parseInt(data.weight), function (err, result) {
        if(err) {
            return res.status(500).json({ resultCode: CODE.VOTE_ERROR.RESCODE, err: err.error_description });
        }
        console.log(result);
        return res.status(200).send();
    });
}

exports.test = async function(req, res, next) {
    client.get("token:userid:477514", async function (err, reply) {
        try{
            await steem.reflashToken(reply.toString());
            res.status(200).send();
        } catch(err){
            if (err instanceof DBError) {
                return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
            } else if (err instanceof SDKError) {
                return res.status(500).json({ resultCode: CODE.STEEMIT_API_ERROR.RESCODE, err:err.description });
            } else {
                return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err });
            }
        }
    });
}

function unzipFile(file, userid, cb) {
    var ret = decompress(file, config.get('steemit.app.gameurl')+"/"+userid,{
        filter: file => path.extname(file.path) !== '.exe'
    }).then(files => {
        cb(files);
    });
}

