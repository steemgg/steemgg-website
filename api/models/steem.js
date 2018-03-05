'use strict';

import sc2 from '../lib/sc2';
import steemitHelpers from '../vendor/steemitHelpers';

exports.comment = function(accessToken, parentAuthor, parentPermlink, author, content, permlink) {
    let operations = [];
    let metaData = {
        community: 'steemitgame',
        tags: ['steemitgame'],
        app: `steemitgame.app/test`
    };
    let commentOp = [
        'comment',
        {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: permlink,
            title: "",
            body: content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);
    let result = sc2.instance.broadcast(accessToken, operations);
    return result;
}

exports.post = function(accessToken, author, title, content, reward, tags, permlink){
    let extensions = [[0, {
        beneficiaries: [
            {
                account: 'steemitgame.dev',
                weight: 2500
            }
        ]
    }]];

    let operations = [];

    let metaData = {
        community: 'steemitgame',
        tags: tags,
        app: `steemitgame.app/test`
    };

    let commentOp = [
        'comment',
        {
            parent_author: "",
            parent_permlink: "steemitgame",
            author: author,
            permlink,
            title: title,
            body: content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);

    let commentOptionsConfig = {
        author: author,
        permlink,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions,
    };

    if (extensions) {
        commentOptionsConfig.extensions = extensions;

        if (reward === '100') {
            commentOptionsConfig.percent_steem_dollars = 0;
        } else {
            commentOptionsConfig.percent_steem_dollars = 10000;
        }

        commentOptionsConfig.max_accepted_payout = '1000000.000 SBD';

        operations.push(['comment_options', commentOptionsConfig]);
    }

    let result = sc2.instance.broadcast(accessToken, operations);
    return result;
}

exports.me = async function(accessToken) {
    let user = await sc2.instance.me(accessToken);
    return user;
}

exports.getLoginUrl = async function() {
    let url = await sc2.instance.getLoginURL('hello');
    return url;
}

exports.revokeToken = async function(accessToken) {
    let result = await sc2.instance.revokeToken(accessToken);
    return result;
}

exports.reflashToken = async function(accessToken) {
    let result = await sc2.instance.reflashToken(accessToken);
    return result;
}

exports.vote = async function(accessToken, voter, author, permlink, weight) {
    let result = await sc2.instance.vote(accessToken, voter, author, permlink, weight);
    return result;
}
