"use strict";

var glob = require('glob');
var upath = require('upath');
var exts = require('ext-map');
var zipObjectDeep = require('lodash/zipObjectDeep');
var merge = require('mixin-deep');

module.exports = function(filepath, opt, cb) {
    var list = {};
    glob(filepath, {}, function (er, files) {
        files.forEach(function(file) {
            var path = upath.changeExt(file, exts[upath.extname(file)]).replace('src/tmpl/', '');            
            var obj = zipObjectDeep([path.replace(/^(partials\/[\w]+\/)/, '').replace(/(\.html)/g, '').replace(/\//g,'.')], [path]);
            list = merge({}, list, obj);
        });

        cb(er, opt.fn(list));
    });
};
