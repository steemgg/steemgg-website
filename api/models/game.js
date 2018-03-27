'use strict';

import db from '../lib/db'

exports.addGame = async function(game) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO games SET ?', game);
    return rows;
}

exports.deleteGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set status = 3 where id= ? and userid= ?', params);
    return rows;
}

exports.updateGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set ? where id= ? and userid= ?', params);
    return rows;
}

exports.auditGame = async function(params, status) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO comments SET ?', params);
    rows = await db.execute(db.WRITE, 'update comments set status = 1 and type = 0 where gameid= ?', params.gameid);
    rows = await db.execute(db.WRITE, 'update games set status=? where id= ?', [status,params.gameid]);
    return rows;
}

exports.reportGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO comments SET ?', params);
    rows = await db.execute(db.WRITE, 'update games set report=1 where id= ?', params.gameid);
    return rows;
}

exports.canReportGame = async function(params) {
    let rows = await db.execute(db.READ, 'select id from comments where userid=? and gameid=? and status=0 and type=0', params);
    return rows;
}

exports.reportComments = async function(params) {
    let rows = await db.execute(db.READ, 'select id,gameid,account,permlink,userid,comment,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified  from comments where gameid=? and status=0 and type=0', params);
    return rows;
}

exports.auditComments = async function(params) {
    let rows = await db.execute(db.READ, 'select id,gameid,account,permlink,userid,comment,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified     from comments where gameid=? and status=0 and type=1', params);
    return rows;
}

exports.getGameById = async function(gameId) {
    let rows = await db.execute(db.READ, 'select id,account,userid,title,coverImage,description,category,version,gameUrl,vote,payout,from_unixtime(created,\'%Y-%m-%dT%TZ\') as created,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified,report,status,recommend from games where id=?', gameId);
    return rows;
}

exports.getActivitiesById = async function(gameId) {
    let rows = await db.execute(db.READ, 'select id,gameid,account,userid,permlink,vote,payout,status,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified from activities where gameid=?', gameId);
    return rows;
}

exports.addActivity = async function(activity) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO activities SET ?', activity);
    return rows;
}

exports.getRecentlyActivity = async function(gameId) {
    let rows = await db.execute(db.READ, 'select id,gameid,account,userid,permlink,vote,payout,status,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified from activities where gameid=? order by lastModified desc limit 1', gameId);
    return rows;
}

exports.getPayoutActivities = async function() {
    let time = Math.floor(new Date() / 1000) - 86400*7;
    let rows = await db.execute(db.READ, 'select id,gameid,account,userid,permlink,vote,payout,status,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModifie from activities where lastModified<? and status=0',time);
    return rows;
}

exports.query = async function(sql, params) {
    let rows = await db.execute(db.READ, sql, params);
    return rows;
}
