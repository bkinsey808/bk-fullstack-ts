/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/express/express.d.ts"/>

import express = require('express');
import path    = require('path');

var app : express.Express = express();

//app.set('view engine', 'html'); // so you can render('index')

app.use(express.static(__dirname + '/public'));

app.get('/api/nav_items', (req, res) => {
	res.send({
		data: [
			'Home',
			'About'
		]
	});
});

var port: number = process.env.PORT || 3000;
var server = app.listen(port, () => {
	var listeningPort: number = server.address().port;
	console.log('The server is listening on port: ' + listeningPort);
});
