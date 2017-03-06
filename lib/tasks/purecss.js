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
        } else {
            cb();
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
        if (breakpoints.hasOwnProperty(key) && key !== 'default') {
            mediaMap[key] = 'screen and (min-width: ' + breakpoints[key].width + ')';
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
    for (var key in breakpoints) {
        if (breakpoints.hasOwnProperty(key)) {
            css += '\n/* ' + key + ' */\n';
            if (key === 'default') {
                createClass();
            } else {
                css += '@media screen and (min-width: ' + breakpoints[key].width + ') {\n';
                createClass('-' + key, '  ');
                css += '}\n';
            }
        }
    }
    writeFile(dest, css, cb);
}

function createGridWrapper(dest, options, cb) {
    if (options.breakpoints) {
        var css = '';
        for (var key in options.breakpoints) {
            if (options.breakpoints.hasOwnProperty(key)) {
                var breakpoint = options.breakpoints[key];
                css += '\n/* ' + key + ' */\n';
                if (breakpoint.wrapper) {
                    var wrapper = breakpoint.wrapper;
                    if (key === 'default') {
                        // Normal Wrapper
                        css += '.' + options.prefix + '-wrapper {\n';
                        if (wrapper.margin) {
                            css += '  margin-left: ' + wrapper.margin + ';\n';
                            css += '  margin-right: ' + wrapper.margin + ';\n';
                        }
                        if (wrapper["max-width"]) {
                            css += '  max-width: ' + wrapper["max-width"] + ';\n';
                        }
                        if (wrapper.overflow) {
                            css += '  overflow: ' + wrapper.overflow + ';\n';
                        }
                        css += '}\n';
                        // Fullscreen Wrapper
                        if (wrapper.margin && /^([0-9]|px|pt|em|rem|%|vw|vh)+$/.test(wrapper.margin)) {
                            css += '.' + options.prefix + '-wrapper-fullscreen {\n';
                            css += '  margin-left: -' + wrapper.margin + ';\n';
                            css += '  margin-right: -' + wrapper.margin + ';\n';
                            css += '}\n';
                        }
                    } else {
                        css += '@media screen and (min-width: ' + breakpoint.width + ') {\n';
                        // Normal Wrapper
                        css += '  .' + options.prefix + '-wrapper {\n';
                        if (wrapper.margin) {
                            css += '    margin-left: ' + wrapper.margin + ';\n';
                            css += '    margin-right: ' + wrapper.margin + ';\n';
                        }
                        if (wrapper["max-width"]) {
                            css += '    max-width: ' + wrapper["max-width"] + ';\n';
                        }
                        if (wrapper.overflow) {
                            css += '    overflow: ' + wrapper.overflow + ';\n';
                        }
                        css += '  }\n';
                        // Fullscreen Wrapper
                        if (wrapper.margin && /^([0-9]|px|pt|em|rem|%|vw|vh)+$/.test(wrapper.margin)) {
                            css += '  .' + options.prefix + '-wrapper-fullscreen {\n';
                            css += '    margin-left: -' + wrapper.margin + ';\n';
                            css += '    margin-right: -' + wrapper.margin + ';\n';
                            css += '  }\n';
                        }
                        css += '} \n';
                    }
                }
            }
        }
        writeFile(dest, css, cb);
    } else {
        cb();
    }
}


function createGridGutter(dest, prefix, options, cb) {
    if (options.breakpoints && prefix) {
        prefix = prefix ? prefix + '-' : '';
        var css = '';
        for (var key in options.breakpoints) {
            if (options.breakpoints.hasOwnProperty(key)) {
                var breakpoint = options.breakpoints[key];
                if (breakpoint.gutterWidth) {
                    css += '\n/* ' + key + ' */\n';
                    if (key === 'default') {
                        css += '[class*="' + prefix + '"] {\n';
                        css += '  box-sizing: border-box;\n';
                        css += '  padding-left: ' + breakpoint.gutterWidth + ';\n';
                        css += '  padding-right: ' + breakpoint.gutterWidth + ';\n';
                        css += '}\n';
                        css += '.grid-g {\n';
                        css += '  margin: 0 -' + breakpoint.gutterWidth + ';\n';
                        css += '}\n';
                    } else {
                        css += '@media screen and (min-width: ' + breakpoint.width + ') {\n';
                        css += '  [class*="' + prefix + '"] {\n';
                        css += '    padding-left: ' + breakpoint.gutterWidth + ';\n';
                        css += '    padding-right: ' + breakpoint.gutterWidth + ';\n';
                        css += '  }\n';
                        css += '  .grid-g {\n';
                        css += '    margin: 0 -' + breakpoint.gutterWidth + ';\n';
                        css += '  }\n';
                        css += '}\n';
                    }
                }
            }
        }
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
            if (breakpoints.hasOwnProperty(key) && key !== 'default') {
                css += '\n/* ' + key + ' */\n';
                css += '@media screen and (min-width: ' + breakpoints[key].width + ') {\n';
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
                if (key !== 'default') {
                    if ('gutterWidth' in breakpoints[key]) {
                        vars += '$gutter-' + key + '-width: ' + breakpoints[key].gutterWidth + ';\n';
                    }
                    vars += '$screen-' + key + '-value: ' + breakpoints[key].width.replace(/^([0-9]+).*$/, '$1') + ';\n';
                    vars += '$screen-' + key + ': ' + breakpoints[key].width + ';\n';
                    vars += '@custom-media --screen-' + key + ' screen and (min-width: ' + breakpoints[key].width + ');\n';
                    if (nextBreakpoint[key]) {
                        // substract one pixel for max width
                        vars += '@custom-media --screen-' + key + '-max screen and (max-width: ' + (parseInt(nextBreakpoint[key].width) - (1 / 16)) + 'rem);\n';
                    }
                    vars += '\n';
                } else {
                    if ('gutterWidth' in breakpoints[key]) {
                        vars += '$gutter-width: ' + breakpoints[key].gutterWidth + ';\n';
                    }
                    if ('width' in breakpoints[key]) {
                        vars += '$screen: ' + breakpoints[key].width + ';\n\n';
                    }
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
