"use strict";

var rework = require('rework');
var reworkSelectors = require('rework-mutate-selectors');
var fs = require('fs');
var path = require('upath');

module.exports = function(name, taskOptions, options) {
    return createPureCSS({
        originPrefix: options.prefix,
        src: path.resolve(taskOptions.root),
        files: [].concat(taskOptions.pureFiles || [])
    });
};

function createPureCSS(options) {
    return new Promise(function(resolve) {
        if (options.files) {
            options.files.forEach(function(file, i) {
                options.files[i] = prefixFile(file, options);
            });
            Promise.all(options.files).then(function(files) {
                resolve(files);
            });
        } else {
            resolve([]);
        }
    });
}

function prefixFile(file, options) {
    return new Promise(function(resolve) {
        fs.readFile(path.resolve(options.src, file + '.css'), 'utf8', function(err, data) {
            var css = rework(data);
            if (options.originPrefix) {
                css.use(reworkSelectors.replace(/^\.pure/g, '.' + options.originPrefix));
            }
            css = css.toString();
            // replace font-families
            css = css.replace(/(^.*font-family.*$)/mg, '/* $1 */');
            resolve({
                name: file,
                content: css
            });
        });
    });
}
