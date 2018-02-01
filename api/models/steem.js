const sc2Api = require('../../sc2');
const steemitHelpers = require('../vendor/steemitHelpers');

exports.comment = function(accessToken, parentAuthor, parentPermlink, author, content, callback) {
    const operations = [];
    const metaData = {
        community: 'steemitgame',
        tags: ['steemitgame'],
        app: `steemitgame.app/test`
    };
    const commentOp = [
        'comment',
        {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: steemitHelpers.createCommentPermlink(parentAuthor, parentPermlink),
            title: "",
            body: content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);
    sc2Api.broadcast(accessToken, operations, function(err, result){
        console.log(err)
        callback(err, result);
    });
}

exports.post = function(accessToken, author, title, content, reward, tags, callback){
    const extensions = [[0, {
        beneficiaries: [
            {
                account: 'steemitgame.dev',
                weight: 2500
            }
        ]
    }]];

    const operations = [];

    const metaData = {
        community: 'steemitgame',
        tags: tags,
        app: `steemitgame.app/test`
    };

    const getPermLink = steemitHelpers.createPermlink(title, author, '', '');
    getPermLink.then(permlink => {
        const commentOp = [
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

        const commentOptionsConfig = {
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

        sc2Api.broadcast(accessToken, operations, function(err, result){
            callback(err, result, permlink);
        });
    });
}

exports.me = function(accessToken, callback) {
    sc2Api.me(accessToken, function (err, result) {
        callback(err, result);
    });
}

exports.getLoginUrl = function(callback) {
    sc2Api.getLoginUrl(function (url) {
        callback(url);
    });
}

exports.revokeToken = function(callback) {
    sc2Api.revokeToken(function (err, result) {
        callback(err, result);
    });
}

exports.reflashToken = function(accessToken, callback) {
    sc2Api.reflashToken(accessToken, function (err, result) {
        callback(err, result);
    });
}

exports.vote = function(accessToken, voter, author, permlink, weight, callback) {
    sc2Api.vote(accessToken, voter, author, permlink, weight, function (err, result) {
        callback(err, result);
    });
}
