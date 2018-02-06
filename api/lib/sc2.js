'use strict';

import config from 'config';
import fetch from 'isomorphic-fetch';
import {SDKError} from '../errors/SDKError'

exports.instance = null;

function SteemConnect() {
  this.options = {
    baseURL: 'https://v2.steemconnect.com',
    app: '',
    callbackURL: '',
    scope: [],
  };
}

SteemConnect.prototype.setBaseURL = function setBaseURL(baseURL) {
  this.options.baseURL = baseURL;
};
SteemConnect.prototype.setApp = function setApp(app) {
  this.options.app = app;
};
SteemConnect.prototype.setCallbackURL = function setCallbackURL(callbackURL) {
  this.options.callbackURL = callbackURL;
};
SteemConnect.prototype.setScope = function setScope(scope) {
  this.options.scope = scope;
};

SteemConnect.prototype.me = async function(accessToken) {
    return  await this.send('me', 'POST', {}, accessToken);
}

SteemConnect.prototype.broadcast = async function broadcast(accessToken, operations) {
    return await this.send('broadcast', 'POST', { operations }, accessToken);
};

SteemConnect.prototype.vote = async function(accessToken, voter, author, permlink, weight) {
    const params = {
        voter,
        author,
        permlink,
        weight,
    };
    return this.broadcast(accessToken, [['vote', params]]);
}

SteemConnect.prototype.getLoginURL = async function(state) {
  let loginURL = `${this.options.baseURL}/oauth2/authorize?client_id=${
    this.options.app
  }&redirect_uri=${encodeURIComponent(this.options.callbackURL)}`;
  loginURL += this.options.scope ? `&scope=${this.options.scope.join(',')}` : '';
  loginURL += state ? `&state=${encodeURIComponent(state)}` : '';
  return loginURL;
};

SteemConnect.prototype.revokeToken = async function revokeToken(accessToken) {
    return  await this.send('oauth2/token/revoke', 'POST', { token: accessToken }, accessToken);
};

SteemConnect.prototype.reflashToken = async function(accessToken){
    return  await this.send('oauth2/token', 'GET', { token: accessToken }, accessToken);
}

SteemConnect.prototype.send = async function send(route, method, body, accessToken) {
    let url = `${this.options.baseURL}/api/${route}`;
    let res = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            Authorization: accessToken,
        },
        body: JSON.stringify(body),
    });
    let data = await res.json();
    if (!res.ok) {
        throw new SDKError("call steemit api error",data)
    }
    return data;
};

exports.Initialize = function Initialize(config) {
    if (!this.instance) {
        this.instance = new SteemConnect();
        if (!config) {
            throw new SDKError('You have to provide config');
        }

        if (typeof config !== 'object') {
            throw new SDKError('Config must be an object');
        }

        if (config.baseURL) this.instance.setBaseURL(config.baseURL);
        if (config.app) this.instance.setApp(config.app);
        if (config.callbackURL) this.instance.setCallbackURL(config.callbackURL);
        if (config.scope) this.instance.setScope(config.scope);
    }
    return this.instance;
};
