'use strict';

//Attachments
var validUrl = require('valid-url');
var Url = require('./model/url');

//PORTS
var port = Number(process.env.PORT || 5000);
var baseUrl = 'http://localhost:' + port + '/';
//MONGOOSE
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;//solved promise error

mongoose.connect('mongodb://localhost/tinyUrl');
mongoose.connection.on('error', function(err) {
        console.error('MongoDB connection error: ' + err);
        process.exit(1);
    }
);

var express = require('express');
var app = express();
app.set('port', Number(process.env.PORT || 5000));

app.get('/new/*', function(req, res) {
    var original = req.url.replace('/new/', '');
    if (!validUrl.isWebUri(original)) {
        return res.json({error: "please enter a valid Url such as http:// + url name"});
    }
    Url.create({original_url: original}, function(err, created) {
        if (err) return res.status(500).send(err);
        res.json({
            original_url: created.original_url,
            short_url: baseUrl + created.short_id
        });
    });
});
//WHERE THE MAGIC HAPPENS
app.get('/*', function(req, res) {
    Url.findOne({short_id: req.url.slice(1)}).then(function(found) {
        if (found) {
            res.redirect(found.original_url);//sends original url
        } else {
            res.send({error: "No short url found for given input"});
        }
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});