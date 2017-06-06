'use strict';

var uniqBy = require('lodash/uniqBy');
var template = require('./controller/template.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var upath = require('upath');
var getDirName = upath.dirname;

var list = [];

module.exports = {
    reset: function() {
        list = [];
    },
    collect: function($) {
        addControllersToList($('.controller[data-controller]'));
        return $;
    },
    createRegistry: function(registry) {
        return new Promise(function(resolve) {
            list = uniqBy(list, 'controller');
            writeFile((registry || {}).file || upath.join('src/js/packages.js'), template({
                    sources: list
                }),
                function() {
                    console.log('saved file:', 'packages.js');
                    resolve();
                });
        });
    }
};

function addControllersToList(nodes) {
    var name, controller;
    for (var i = 0; i < nodes.length; i++) {
        name = nodes.eq(i).data('controller');
        controller = name === process.env.npm_package_name ? upath.join(name, 'default') : name;
        controller = upath.normalizeSafe(controller.replace(RegExp(process.env.npm_package_name + '\/(.*)'), '../../src/$1'));
        list.push({
            name: name,
            controller: controller,
            chunk: nodes.eq(i).data('chunk') || false
        });
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
