"use strict";

var through = require('through2');
var cheerio = require('cheerio');
var controller = require('./registry/controller');

module.exports = {
    reset: function() {
        controller.reset();
    },
    collect: function() {
        return through.obj(function(file, enc, cb) {
            if (file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                controller.collect($);
            }
            cb();
        });
    },
    createRegistry: function(controllerRegistry) {
        return Promise.all([controller.createRegistry(controllerRegistry)]);
    }
};
