'use strict';

import db from '../lib/db';
import redis from '../lib/redis';

exports.getUserByAccount = async function(account) {
    let rows = await db.execute(db.READ, 'select id,account,userid,role,status,from_unixtime(created,\'%Y-%m%dT%TZ\') as created from user where account = ?', account);
    return rows;
}

exports.addUser = async function(user) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO user SET ?', user);
    return rows;
}

exports.getUserToken = async function(key) {
    let result = await redis.instance.get(key);
    return result;
}

exports.setUserToken = async function(key, value) {
    let result = await redis.instance.set(key, value);
    return result;
}

exports.setTokenExpire = async function(key, seconds) {
    return await redis.instance.expire(key, seconds);
}

exports.setInterval = async function(key, seconds) {
    await redis.instance.set(key, true);
    return await redis.instance.expire(key, seconds);
}

exports.getInterval = async function(key) {
    let result = await redis.instance.get(key);
    return result;
}

exports.getTTL = async function(key) {
    return await redis.instance.ttl(key);
}
