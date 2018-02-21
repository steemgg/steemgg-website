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
    this.options.expire = promisify(this.options.client.expire).bind(this.options.client);
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
