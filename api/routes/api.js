'use strict';

module.exports = function(app) {
  var api  = require('../controllers/apiController');

  app.post('/upload', api.upload);
  app.post('/post', api.upload);
  app.get('/', api.index);

  var callback  = require('../controllers/callbackController');
  app.get('/callback', callback.auth);
};

