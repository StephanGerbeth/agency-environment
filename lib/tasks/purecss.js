"use strict";

var rework = require('rework');
var reworkSelectors = require('rework-mutate-selectors');
var pureGrids = require('rework-pure-grids');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

module.exports = function(config) {
    return function(cb) {
        createPureCSS({
            originPrefix: config.prefix,
            src: path.resolve('.', config.nodePath, 'purecss', 'build'),
            dest: path.resolve(config.files.dest, 'purecss'),
            files: [].concat(config.files.src || [])
        }, function() {
            var prefix = [];
            if (config.columnHasPrefix) {
                prefix.push(config.prefix);
            }
            if (config.columnPrefix) {
                prefix.push(config.columnPrefix);
            }
            createGrid(config.files.dest + 'custom-grid.css', config.breakpoints, prefix.join('-'), function() {
                createCustomMediaVariables(config.files.dest + 'custom-media-variables.pcss', config.breakpoints, function() {
                    cb();
                });
            });
        });
    };
};

function createPureCSS(options, cb) {
    if (options.files) {
            var prefixFiles = function(cb) {
                if (options.files.length) {
                    var file = options.files.pop();
                    fs.readFile(path.resolve(options.src, file + '.css'), 'utf8', function(err, data) {
                        var css = rework(data);
                        if (options.prefix) {
                            css.use(reworkSelectors.prefix(options.prefix));
                        }
                        if (options.originPrefix) {
                            css.use(reworkSelectors.replace(/^\.pure/g, '.' + options.originPrefix));
                        }
                        writeFile(path.resolve(options.dest, file + '.css'), css.toString(), function() {
                            prefixFiles(cb);
                        });
                    });
                } else {
                    cb();
                }
            };
            prefixFiles(function() {
                cb();
            });
    } else {
        cb();
    }
}

function createGrid(dest, map, prefix, cb) {
    var css = rework('').use(pureGrids.units(12, {
        decimals: 4,
        includeOldIEWidths: false,
        includeReducedFractions: false,
        includeWholeNumbers: false,
        selectorPrefix: '.' + prefix + '-',
        mediaQueries: map
    })).toString();
    writeFile(dest, css, cb);
}

function createCustomMediaVariables(dest, map, cb) {
    var vars = '';
    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            vars += '@custom-media --screen-' + key + ' ' + map[key] + ';\n';
        }
    }
    writeFile(dest, vars, cb);
}

var getDirName = require("upath").dirname;

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
