"use strict";

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {
        var css = '';
        css += createMedias(options);
        if ('variables' in taskOptions && taskOptions.variables) {
            for (var variable in taskOptions.variables) {
                if (taskOptions.variables.hasOwnProperty(variable)) {
                    css += createVar(variable, taskOptions.variables[variable]);
                }
            }
        }
        resolve([{
            name: name,
            content: css
        }]);
    });
};

function createVar(name, value) {
    return '$' + name + ': ' + value + ';\n';
}

function createCustomMedia(name, value) {
    return '@custom-media ' + name + ' ' + value + ';\n';
}

function createMedias(options) {
    var css = '',
        nextBreakpoint = {},
        key, last;
    for (key in options.breakpoints) {
        if (options.breakpoints.hasOwnProperty(key)) {
            if (last) {
                nextBreakpoint[last] = options.breakpoints[key];
            }
            last = key;
        }
    }
    for (key in options.breakpoints) {
        if (options.breakpoints.hasOwnProperty(key)) {
            if (key in options.gutters) {
                css += createVar('grid-gutter-' + key, options.gutters[key]);
            }
            css += createVar('screen-' + key, options.breakpoints[key]);
            css += createCustomMedia('--screen-' + key, 'screen and (min-width: ' + options.breakpoints[key] + ')');
            if (nextBreakpoint[key]) {
                // substract one pixel for max width
                css += createCustomMedia('--screen-' + key + '-max', 'screen and (max-width: ' + (parseInt(nextBreakpoint[key]) - (1 / 16)) + 'rem)');
            }
            css += '\n';
        }
    }
    return css;
}
