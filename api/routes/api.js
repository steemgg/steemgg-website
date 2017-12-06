'use strict';
var fs = require('fs'),
    config = require('config');

module.exports = function(app) {
  var api  = require('../controllers/apiController');

  app.post('/upload', [userMiddleware], api.upload);
  app.post('/post', [userMiddleware], api.upload);
  app.post('/add', [userMiddleware], api.addGame);
  app.get('/me', [morkMiddleware], api.me);
  app.get('/logout', api.logout);
  app.get('/', api.index);

  var callback  = require('../controllers/callbackController');
  app.get('/callback', callback.auth);
};

function morkMiddleware (req, res, next) {
    if (!req.session.accessToken && process.env.NODE_ENV === 'development' && req.cookies['at'] == 'test') {
        fs.readFile( config.get('steemit.app.rooturl') + '/test.json', 'utf8', function (err, result) {
            if (err) {
                return console.log(err);
            }
            req.session.user = JSON.parse(result);
            res.status(200).json(JSON.parse(result));
        });
        return;
    }
    next();
}

function userMiddleware (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'must be connect steemit' });
    }
    next();
}
