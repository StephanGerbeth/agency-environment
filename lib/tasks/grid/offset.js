"use strict";

module.exports = function(name, taskOptions, options) {
    return new Promise(function(resolve) {

        var files = [];
        options.columns.forEach(function(columns) {

            var css = '/* default */\n';
            css += createRule(options, columns, options.columnPrefix + '-', null);
            for (var key in options.breakpoints) {
                if (options.breakpoints.hasOwnProperty(key) && key !== 'default') {
                    css += '\n/* ' + key + ' */\n';
                    css += '@media screen and (min-width: ' + options.breakpoints[key] + ') {\n';
                    css += createRule(options, columns, options.columnPrefix + '-', key, '  ');
                    css += '}\n';
                }
            }
            files.push({
                name: name + '-' + columns,
                content: css
            });
        });
        resolve(files);
    });
};

function createRule(options, columns, prefix, key, spacer) {
    var rule = '';
    key = key ? key + '-' : '';
    spacer = spacer || '';
    for (var i = 0; i <= columns; i++) {
        rule += spacer + '.' + prefix + key + 'offset-' + i + '-' + columns + ' {\n';
        rule += spacer + '  margin-left: ' + ((i / columns) * 100) + '\%;\n';
        rule += spacer + '} \n';
    }
    return rule;
}
