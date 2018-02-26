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

exports.auditGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set status=? where id= ?', params);
    return rows;
}

exports.reportGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set report=? where id= ?', params);
    return rows;
}

exports.getGameById = async function(gameId) {
    let rows = await db.execute(db.READ, 'select id,account,userid,title,coverImage,description,category,version,gameUrl,vote,payout,from_unixtime(created,\'%Y-%m-%dT%TZ\') as created,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModified,report,status from games where id=?', gameId);
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
    console.log(time)
    let rows = await db.execute(db.READ, 'select id,gameid,account,userid,permlink,vote,payout,status,from_unixtime(lastModified,\'%Y-%m-%dT%TZ\') as lastModifie from activities where lastModified<? and status=0',time);
    return rows;
}

exports.query = async function(sql, params) {
    let rows = await db.execute(db.READ, sql, params);
    return rows;
}