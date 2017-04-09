"use strict";

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {
        var prefix = options.prefix ? options.prefix + '-' : '';
        var css = '';
        for (var key in options.breakpoints) {
            if (options.gutters.hasOwnProperty(key)) {
                var gutter = options.gutters[key];
                css += '/* ' + key + ' */\n';
                if (key === 'default') {
                    css += createRule(gutter, prefix, options);
                } else {
                    css += '@media screen and (min-width: ' + options.breakpoints[key] + ') {\n';
                    css += createRule(gutter, prefix, options, '  ');
                    css += '}\n';
                }
                css += '\n';
            }
        }
        resolve([{
            name: name,
            content: css
        }]);
    });
};

function createRule(breakpoint, prefix, options, spacer) {
    var rule = (spacer || '') + '[class*="' + options.columnPrefix + '-"], .' + prefix + 'wrapper, .' + prefix + 'wrapper-fluid {\n';
    rule += (spacer || '') + '  box-sizing: border-box;\n';
    rule += (spacer || '') + '  padding-left: ' + breakpoint + ';\n';
    rule += (spacer || '') + '  padding-right: ' + breakpoint + ';\n';
    rule += (spacer || '') + '}\n';
    rule += (spacer || '') + '.grid-g {\n';
    rule += (spacer || '') + '  margin: 0 -' + breakpoint + ';\n';
    rule += (spacer || '') + '}\n';
    return rule;
}
