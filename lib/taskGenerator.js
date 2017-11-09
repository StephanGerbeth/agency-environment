"use strict";

var gulp = require('gulp');
var runSequence = require('run-sequence');

module.exports = function(name, config, serverConfig, taskPattern, mainTask) {

    if (serverConfig.livereload) {
        var watcher = null;
        (config.watch || []).forEach(function(watch) {
            if (!watch.tasks) {
                if (!watcher && watch.partialRendering) {
                    watcher = gulp.watch(watch.src, watch.options || {}, [name]);
                } else {
                    if (watcher && watch.partialRendering) {
                        console.error('partialRendering can be set once.');
                    }
                    gulp.watch(watch.src, watch.options || {}, [name]);
                }
            } else {
                gulp.watch(watch.src, watch.options || {}, watch.tasks.map(function(task) {
                    return name + ':' + task;
                }));
            }
        });
    }

    var tasks = config.subtasks.map(function(task) {
        var taskName = name + ':' + task.name;
        taskPattern(taskName, task, watcher);
        return taskName;
    });

    return function(cb) {
        if (cb) {
            if (mainTask) {
                mainTask(config, tasks, cb);
            } else {
                runSequence.use(gulp).call(null, tasks, cb);
            }
        } else {
            return tasks;
        }
    };
};
