"use strict";

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('upath');
var taskGenerator = require('../taskGenerator');


module.exports = function(name, config, serverConfig) {
    var complete;
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        var config = require(task.config).find(function(generate) {
            if (taskName.replace(/^[^:]+:(.*)$/, '$1') === generate.name) {
                return generate;
            }
        });

        var options = config.options;
        complete = Promise.all([].concat(config.features).concat(config.environments).map(function(generate) {
            return generate.file(generate.name, generate.config || {}, options);
        })).then(function(completeTasks) {
            var writes = [];
            var imports = [];
            completeTasks.forEach(function(files) {
                files.forEach(function(file) {
                    imports.push('@import "./grid/' + file.name + '.pcss";');
                });
                files.push({
                    path: '../',
                    name: 'grid',
                    content: imports.join('\n')
                });
                files.forEach(function(file) {
                    writes.push(writeFile(path.resolve(task.dest, (file.path ? file.path : '') + (options.filePrefix ? options.filePrefix + '-' : '') + file.name + '.pcss'), file.content));
                });
            });
            return Promise.all(writes);
        });

    }, function(config, tasks, cb) {
        complete.then(function() {
            cb();
        });
    });
};

function writeFile(filePath, content) {
    return new Promise(function(resolve, reject) {
        mkdirp(path.dirname(filePath), function(err) {
            if (err) {
                return reject(err);
            }
            fs.writeFile(filePath, content, resolve);
        });
    });
}
