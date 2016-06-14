"use strict";

var rework = require('rework');
var reworkSelectors = require('rework-mutate-selectors');
var pureGrids = require('rework-pure-grids');
var mkdirp = require('mkdirp');
var fs = require('fs');
var upath = require('upath');

module.exports = function(config) {
    return function(cb) {
        if (config) {
            var destPath = upath.resolve(config.files.dest, 'purecss');
            createPureCSS({
                originPrefix: config.prefix,
                src: upath.resolve('node_modules', 'purecss', 'build'),
                dest: destPath,
                files: [].concat(config.files.src || [])
            }, function() {
                var prefix = [];
                if (config.columnHasPrefix) {
                    prefix.push(config.prefix);
                }
                if (config.columnPrefix) {
                    prefix.push(config.columnPrefix);
                }
                createGrid(upath.resolve(destPath, 'custom-grid.css'), config.breakpoints, prefix.join('-'), function() {
                    createGridGutter(upath.resolve(destPath, 'custom-grid-gutter.css'), prefix.join('-'), config, function() {
                        createGridOffset(upath.resolve(destPath, 'custom-grid-offset.css'), config.breakpoints, config.columns, prefix.join('-'), function() {
                            createGridWrapper(upath.resolve(destPath, 'custom-wrapper.css'), config, function() {
                                createVisibleHidden(upath.resolve(destPath, 'custom-visible-hidden.css'), config.breakpoints, config.prefix, function() {
                                    createCustomMediaVariables(upath.resolve(destPath, 'custom-media-variables.pcss'), config.breakpoints, function() {
                                        cb();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    };
};

function createPureCSS(options, cb) {
    if (options.files) {
        var prefixFiles = function(cb) {
            if (options.files.length) {
                var file = options.files.pop();
                fs.readFile(upath.resolve(options.src, file + '.css'), 'utf8', function(err, data) {
                    var css = rework(data);
                    if (options.prefix) {
                        css.use(reworkSelectors.prefix(options.prefix));
                    }
                    if (options.originPrefix) {
                        css.use(reworkSelectors.replace(/^\.pure/g, '.' + options.originPrefix));
                    }
                    writeFile(upath.resolve(options.dest, file + '.css'), css.toString(), function() {
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

function createGrid(dest, breakpoints, prefix, cb) {
    var mediaMap = {};
    for (var key in breakpoints) {
        if (breakpoints.hasOwnProperty(key)) {
            mediaMap[key] = 'screen and (min-width: ' + breakpoints[key] + ')';
        }
    }
    var css = rework('').use(pureGrids.units(12, {
        decimals: 4,
        includeOldIEWidths: false,
        includeReducedFractions: false,
        includeWholeNumbers: false,
        selectorPrefix: '.' + prefix + '-',
        mediaQueries: mediaMap
    })).toString();
    writeFile(dest, css, cb);
}

function createVisibleHidden(dest, breakpoints, prefix, cb) {
    prefix = prefix ? prefix + '-' : '';
    var createClass = function(key, spacer) {
        key = key || '';
        spacer = spacer || '';
        css += spacer + '.' + prefix + 'visible' + key + ' {\n';
        css += spacer + '  display: block;\n';
        css += spacer + '}\n';
        css += spacer + '.' + prefix + 'hidden' + key + ' {\n';
        css += spacer + '  display: none;\n';
        css += spacer + '}\n';
    };
    var css = '';
    createClass();
    for (var key in breakpoints) {
        if (breakpoints.hasOwnProperty(key)) {
            css += '\n/* ' + key + ' */\n';
            css += '@media screen and (min-width: ' + breakpoints[key] + ') {\n';
            createClass('-' + key, '  ');
            css += '}\n';
        }
    }

    writeFile(dest, css, cb);
}

function createGridWrapper(dest, options, cb) {
    if (options.breakpoints) {
        var css = '';
        css += '.' + options.prefix + '-wrapper {\n';
        css += '  margin-left: auto;\n';
        css += '  margin-right: auto;\n';
        css += '}\n';
        for (var key in options.breakpoints) {
            if (options.breakpoints.hasOwnProperty(key)) {
                css += '\n/* ' + key + ' */\n';
                css += '@media screen and (min-width: ' + options.breakpoints[key] + ') {\n';
                css += '  .' + options.prefix + '-wrapper {\n';
                if (options.wrapperBreakpoints.indexOf(key) > -1) {
                    css += '  max-width: ' + options.breakpoints[key] + ';\n';
                }
                css += '  }\n';
                css += '} \n';
            }
        }
        writeFile(dest, css, cb);
    } else {
        cb();
    }
}

function createGridGutter(dest, prefix, options, cb) {
    prefix = prefix ? prefix + '-' : '';
    if (options.gutterWidth && prefix) {
        var css = '';
        css += '[class *= "' + prefix + '"] {\n';
        css += '  box-sizing: border-box;\n';
        css += '  padding-left: ' + options.gutterWidth + ';\n';
        css += '  padding-right: ' + options.gutterWidth + ';\n';
        css += '}\n';
        css += '.grid-g {\n';
        css += '  margin: 0 -' + options.gutterWidth + ';\n';
        css += '}\n';
        writeFile(dest, css, cb);
    } else {
        cb();
    }
}

function createGridOffset(dest, breakpoints, columns, prefix, cb) {
    if (breakpoints) {
        var css = '';
        var createClass = function(key, spacer) {
            key = key || '';
            spacer = spacer || '';
            for (var i = 0; i <= columns; i++) {
                css += spacer + '.' + prefix + key + '-offset-' + i + '-' + columns + ' {\n';
                css += spacer + '  margin-left: ' + ((i / columns) * 100) + '\%;\n';
                css += spacer + '} \n';
            }
        };
        createClass();
        for (var key in breakpoints) {
            if (breakpoints.hasOwnProperty(key)) {
                css += '@media screen and (min-width: ' + breakpoints[key] + ') {\n';
                createClass('-' + key, '  ');
                css += '}\n';
            }
        }
        writeFile(dest, css, cb);
    } else {
        cb();
    }
}

function createCustomMediaVariables(dest, breakpoints, cb) {
    if (breakpoints) {
        var vars = '',
            nextBreakpoint = {},
            key, last;
        for (key in breakpoints) {
            if (breakpoints.hasOwnProperty(key)) {
                if (last) {
                    nextBreakpoint[last] = breakpoints[key];
                }
                last = key;
            }
        }
        for (key in breakpoints) {
            if (breakpoints.hasOwnProperty(key)) {
                vars += '$screen-' + key + ': ' + breakpoints[key] + ';\n';
                vars += '@custom-media --screen-' + key + ' screen and (min-width: ' + breakpoints[key] + ');\n';
                if (nextBreakpoint[key]) {
                    // substract one pixel for max width
                    vars += '@custom-media --screen-' + key + '-max screen and (max-width: ' + (parseInt(nextBreakpoint[key]) - (1 / 16)) + 'em);\n';
                }
            }
        }
        writeFile(dest, vars, cb);
    } else {
        cb();
    }
}

function writeFile(path, content, cb) {
    mkdirp(upath.dirname(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
