'use strict';

var unique = require('lodash/uniq');
var template = require('./controller/template.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('upath').dirname;

var list = [];

module.exports = {
    reset: function() {
        list = [];
    },
    collect: function($) {
        addControllersToList($('.controller[data-controller]'));
    },
    createRegistry: function(registry) {
        return new Promise(function(resolve) {
            list = unique(list);
            writeFile((registry || {}).file || "src/js/packages.js", template({
                sources: list
            }), function() {
                console.log('saved file:', 'packages.js');
                resolve();
            });
        });

    }
};

function addControllersToList(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        list.push(nodes.eq(i).data('controller'));
    }
}

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
