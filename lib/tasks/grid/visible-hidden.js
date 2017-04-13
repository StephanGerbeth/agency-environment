"use strict";

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {
        var css = '';
        for (var key in options.breakpoints) {
            if (options.breakpoints.hasOwnProperty(key)) {
                css += '/* ' + key + ' */\n';
                if (key === 'default') {
                    css += createRule(taskOptions, options, options.prefix + '-');
                    css += '\n';
                } else {
                    css += '@media screen and (min-width: ' + options.breakpoints[key] + ') {\n';
                    css += createRule(taskOptions, options, options.prefix + '-', key + '-', '  ');
                    css += '}\n';
                }
            }
        }
        resolve([{
            name: name,
            content: css
        }]);
    });
};

function createRule(taskOptions, options, prefix, key, spacer) {
    var rule = '';
    key = key || '';
    spacer = spacer || '';
    rule += spacer + '.' + prefix + key + 'visible' + ' {\n';
    rule += spacer + '  display: block' + (taskOptions.important ? ' !important' : '') + ';\n';
    rule += spacer + '}\n';
    rule += spacer + '.' + prefix + key + 'hidden' + ' {\n';
    rule += spacer + '  display: none' + (taskOptions.important ? ' !important' : '') + ';\n';
    rule += spacer + '}\n';
    return rule;
}
