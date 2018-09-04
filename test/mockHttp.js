var http = require('http');

var TEST_HOST  = 'localhost';
var TEST_PORT  = 9876;

function TestServer() {
    var self = this;
    var app = require('../app');
    self.server = http.createServer(app);
}

TestServer.prototype.start = function() {
    var self = this;
    if (self.server) {
        self.server.listen(TEST_PORT, TEST_HOST);
    } else {
        throw new Error('Server not found');
    }
};

TestServer.prototype.stop = function() {
    var self = this;
    self.server.close();
};

function http_get(host, port, url, cb) {
    var options = {
        host: host,
        port: port,
        path: url,
        method: 'GET'
    };
    var req = http.request(options, function(res) {
        var buffer = '';
        res.on('data', function(data) {
            buffer += data;
        });
        res.on('end',function(){
            cb(null, req, res, buffer);
        });
    });
    req.end();
    req.on('error', function(e) {
        cb(e, null);
    });
}

var client = {
    get: function(url, cb) {
        http_get(TEST_HOST, TEST_PORT, url, cb);
    }
};

var mockHttp = {
    server: {
        create: function() {
            return new TestServer();
        }
    },

    client: client
};
module.exports = mockHttp;
