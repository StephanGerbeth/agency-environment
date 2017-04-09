'use strict';

var unique = require('lodash/uniq');
var template = require('./critical/template.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('upath').dirname;

var list = [];

var criticalPartialsFile = "src/pcss/partials.critical.pcss";
if (!fs.existsSync(criticalPartialsFile)) {
    writeFile(criticalPartialsFile, template({
        partials: []
    }), function() {
        console.log('saved file:', 'partials.critical.pcss');
    });
}

module.exports = {
    reset: function() {
        list = [];
    },
    collect: function($) {
        addCriticalPartialsToList($('.partial[data-partial][data-critical]'));
    },
    createRegistry: function() {
        return new Promise(function(resolve) {
            list = unique(list);
            writeFile(criticalPartialsFile, template({
                partials: list
            }), function() {
                console.log('saved file:', 'partials.critical.pcss');
                resolve();
            });
        });
    }
};

function addCriticalPartialsToList(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        list.push(nodes.eq(i).data('partial'));
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
