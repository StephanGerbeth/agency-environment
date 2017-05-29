"use strict";

var rework = require('rework');
var pureGrids = require('rework-pure-grids');

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {
        var mediaMap = {};
        for (var key in options.breakpoints) {
            if (options.breakpoints.hasOwnProperty(key) && key !== 'default') {
                mediaMap[key] = 'screen and (min-width: ' + options.breakpoints[key] + ')';
            }
        }
        var files = [];
        options.columns.forEach(function(value) {
            files.push({
                name: name + '-' + value,
                content: rework('').use(pureGrids.units(value, {
                    decimals: 4,
                    includeOldIEWidths: false,
                    includeReducedFractions: false,
                    includeWholeNumbers: false,
                    selectorPrefix: '.' + options.columnPrefix + '-',
                    mediaQueries: mediaMap
                })).toString()
            });
        });
        resolve(files);
    });
};
