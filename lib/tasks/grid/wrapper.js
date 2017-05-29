"use strict";

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {
        var css = '';
        css += '.' + options.prefix + '-wrapper-fluid {\n';
        css += '    margin-left: auto;\n';
        css += '    margin-right: auto;\n';
        css += '}\n';
        css += '/* Overflow Wrapper */\n';
        css += '.' + options.prefix + '-wrapper-overflow-wrap {\n';
        css += '    overflow: hidden;\n';
        css += '}\n';
        css += '.' + options.prefix + '-wrapper-overflow-x-wrap {\n';
        css += '    overflow-x: hidden;\n';
        css += '    overflow-y: auto;\n';
        css += '}\n';
        css += '.' + options.prefix + '-wrapper-overflow-y-wrap {\n';
        css += '    overflow-x: auto;\n';
        css += '    overflow-y: hidden;\n';
        css += '}\n';
        for (var key in taskOptions.breakpoints) {
            if (taskOptions.breakpoints.hasOwnProperty(key)) {
                var breakpoint = taskOptions.breakpoints[key];
                css += '\n/* ' + key + ' */\n';
                if (breakpoint) {
                    var wrapper = breakpoint;
                    if (key === 'default') {
                        // Normal Wrapper
                        css += createRule(wrapper, options);
                    } else {
                        css += '@media screen and (min-width: ' + options.breakpoints[key] + ') {\n';
                        css += createRule(wrapper, options, '  ');
                        css += '} \n';
                    }
                }
            }
        }
        resolve([{
            name: name,
            content: css
        }]);
    });
};

function createRule(properties, options, spacer) {
    var rule = (spacer || '') + '.' + options.prefix + '-wrapper {\n';
    for (var property in properties) {
        if (properties.hasOwnProperty(property)) {
            rule += (spacer || '') + '  ' + property + ': ' + properties[property] + ';\n';
        }
    }
    rule += (spacer || '') + '}\n';
    return rule;
}
