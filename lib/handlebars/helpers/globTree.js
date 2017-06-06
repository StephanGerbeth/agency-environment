"use strict";

var glob = require('glob');
var fs = require('fs');
var upath = require('upath');

module.exports = function(filepath, opt, cb) {

    opt = arguments[arguments.length - 2];
    cb = arguments[arguments.length - 1];

    var ignore = [];
    for (var i = 0; i < arguments.length - 2; i++) {
        if (/^\!{1,1}/.test(arguments[i])) {
            ignore.push(arguments[i].replace(/^\!/, ''));
        }
    }

    var list = {};
    fs.stat(filepath, function(stat) {
        if (stat) {
            glob(filepath, {
                ignore: ignore
            }, function(er, files) {
                cb(er, opt.fn(getMappedPartials(files)));
            });

        } else {
            cb(null, opt.fn(list));
        }
    });
};

function getMappedPartials(files) {
    var partials = [],
        partial;
    files.forEach(function(path) {
        partial = {
            name: null,
            url: null,
            path: null,
            base: null,
            list: []
        };
        partial.name = upath.basename(path).replace(upath.extname(path), '');
        if (partial.name === 'index') {
            partial.name = upath.basename(upath.dirname(path));
        }
        partial.path = path.replace(upath.extname(path), '');
        partial.url = path;

        partial.path = partial.path.replace(/(src|test)\/tmpl\/partials\//, '');
        partial.path = partial.path.replace(/(.*)tmpl\/(.*)/, '$1$2');
        partial.url = partial.url.replace(/(src|test)\/tmpl\/partials/, 'partials');
        partial.url = partial.url.replace(/\.hbs$/, '.html');
        partial.base = upath.dirname(partial.path);

        partials.push(partial);
    });
    for (var i = 0; i < partials.length; i++) {
        partial = partials[i];
        if (partial.base !== '.') {

            var parentPartial = null;
            for (var j = 0; j < partials.length; j++) {
                if (partials[j].path === partial.base && partial.base !== '.') {
                    parentPartial = partials[j];
                }
            }

            if (!parentPartial) {
                parentPartial = {
                    name: upath.basename(upath.dirname(partial.path)),
                    url: null,
                    path: partial.base,
                    base: upath.dirname(partial.base),
                    list: []
                };
                partials.push(parentPartial);
            }

            parentPartial.list.push(partial);
        }
    }
    return (partials.find(function(partial) {
        if (partial.base === '.') {
            return partial;
        }
    }) || {
        list: []
    }).list;
}
