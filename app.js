require('babel-core/register');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('config'); var db = require('./api/lib/db');
var redis = require('./api/lib/redis');
var sc2NewApi = require('./api/lib/sc2');
var redisStore = require('connect-redis')(session);

var app = express();

// Connect to MySQL on start
db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  }
});

// init Redis
redis.Initialize({
    url: config.get('steemit.redis.host'),
    port: config.get('steemit.redis.port')
});


// init sc2
sc2NewApi.Initialize({
    app: config.get('steemit.sc.app'),
    callbackURL: config.get('steemit.sc.cburl'),
    baseURL: config.get('steemit.sc.url'),
    scope: config.get('steemit.sc.scope'),
    secret: config.get('steemit.sc.secret')
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sess = {
  secret: config.get('steemit.app.secret'),
  store: new redisStore({ host: config.get('steemit.redis.host'), port: config.get('steemit.redis.port'), client: redis.instance.client, ttl: config.get('steemit.app.sessionTime') }),
  cookie: {
      path     : '/',
      domain   : '.steemitgame.com'
  },
  resave: false,
  saveUninitialized: false
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}

app.use(session(sess))

var routes = require('./api/routes/api'); //importing route
routes(app);

module.exports = app;
