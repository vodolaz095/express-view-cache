var assert = require('assert');
var cm = require('./index.js');

var request = {'originalUrl':'/index', 'method':'GET'};

var response = {
    'header':function (header) {
        console.log('Header set');
        assert.equal(header, 'Cache-Control', "public, max-age=60, must-revalidate");
    },
    'send':function (content) {
        console.log(content);
    }
};

var next = function () {
    console.log('Next called!')
};

cm()(request, response, next);
