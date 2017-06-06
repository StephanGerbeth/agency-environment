"use strict";
var fs = require('fs');
var glob = require('glob');

module.exports = function(filepath, options, cb) {
    if (arguments.length > 2) {
        glob(filepath, options, function(er, files) {
            readFiles(files, function(content) {
                cb(null, content);
            }, '', filepath);
        });
    } else {
        arguments[1](null, arguments[0].fn());
    }
};

function readFiles(files, cb, fileContent, filepath) {
    var file = files.shift();
    if (fs.existsSync(file)) {
        fs.readFile(file, 'utf8', function(err, content) {
            fileContent += content;
            if (files.length) {
                readFiles(files, cb, fileContent);
            } else {
                cb(fileContent);
            }
        });
    } else {
        cb('/* [Handlebars][RAW] Can\'t file ' + filepath + ' */');
    }
}
