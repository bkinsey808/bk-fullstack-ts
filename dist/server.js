/// <reference path="/typings/tsd.d.ts" />
/// <reference path="/typings/node/node.d.ts"/>
/// <reference path="/typings/express/express.d.ts"/>
var express = require('express');
var app = express();
app.set('view engine', 'html');
app.use(express.static('public'));
app.get('/api/books', function (req, res) {
    res.send({
        data: [
            'book 1',
            'book 2'
        ]
    });
});
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    var listeningPort = server.address().port;
    console.log('The server is listening on port: ' + listeningPort);
});
