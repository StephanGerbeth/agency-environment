"use strict";

var through = require('through2');
var cheerio = require('cheerio');
var controller = require('./registry/controller');
var critical = require('./registry/critical');

module.exports = {
    reset: function() {
        controller.reset();
        critical.reset();
    },
    collect: function() {
        return through.obj(function(file, enc, cb) {
            if (file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                controller.collect($);
                critical.collect($);
            }
            cb();
        });
    },
    createRegistry: function(controllerRegistry) {
        return Promise.all([controller.createRegistry(controllerRegistry), critical.createRegistry()]);
    }
};
