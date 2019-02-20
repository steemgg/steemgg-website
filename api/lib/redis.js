'use strict';

import redis from 'redis';
import {promisify} from 'util';

exports.instance = null;

function Redis(host, port) {
    this.options = {};
    this.options.client = redis.createClient(
        {
            host: host,
            port: port
        }
    );
    this.options.get = promisify(this.options.client.get).bind(this.options.client);
    this.options.set = promisify(this.options.client.set).bind(this.options.client);
    this.options.hmset = promisify(this.options.client.hmset).bind(this.options.client);
    this.options.del = promisify(this.options.client.del).bind(this.options.client);
    this.options.hdel = promisify(this.options.client.hdel).bind(this.options.client);
    this.options.hgetall = promisify(this.options.client.hgetall).bind(this.options.client);
    this.options.expire = promisify(this.options.client.expire).bind(this.options.client);
    this.options.ttl = promisify(this.options.client.ttl).bind(this.options.client);
    this.options.zadd = promisify(this.options.client.zadd).bind(this.options.client);
    this.options.zrange = promisify(this.options.client.zrange).bind(this.options.client);
    this.options.zrevrange = promisify(this.options.client.zrevrange).bind(this.options.client);
}

Redis.prototype.get = async function(key) {
    return  await this.options.get(key);
}

Redis.prototype.set = async function(key, value) {
    return  await this.options.set(key, value);
}

Redis.prototype.expire = async function(key, seconds) {
    return  await this.options.expire(key, seconds);
}

Redis.prototype.hgetall = async function(key) {
    return  await this.options.hgetall(key);
}

Redis.prototype.hdel = async function(key, k) {
    return  await this.options.hdel(key, k);
}

Redis.prototype.del = async function(key) {
    return  await this.options.del(key);
}

Redis.prototype.hmset = async function(key, value) {
    return  await this.options.hmset(key, value);
}

Redis.prototype.ttl = async function(key) {
    return  await this.options.ttl(key);
}

Redis.prototype.zadd = async function(key, num, val) {
    return  await this.options.zadd(key, num, val);
}

Redis.prototype.zrevrange = async function(key, start, end) {
    return  await this.options.zrevrange(key, start, end, 'withscores');
}


exports.Initialize = function Initialize(config) {
    if (!config) {
        throw new SDKError('You have to provide config');
    }

    if (typeof config !== 'object') {
        throw new SDKError('Config must be an object');
    }
    if (!this.instance) {
        this.instance = new Redis(config.url, config.port);
    }
    return this.instance;
};
