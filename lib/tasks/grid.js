"use strict";

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('upath');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    var options = config.options;
    var subtasks = [];

    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        if (task.file) {
            subtasks.push(require(task.file)(task.name, task.config || {}, options));
        }
    }, function(config, tasks, cb) {
        Promise.all(subtasks).then(function(completeTasks) {
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
                    writes.push(writeFile(path.resolve(options.dest, (file.path ? file.path : '') + (options.filePrefix ? options.filePrefix + '-' : '') + file.name + '.pcss'), file.content));
                });
            });
            writes.push();
            Promise.all(writes).then(function() {
                cb();
            });
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
