"use strict";

var gulp = require('gulp');
var runSequence = require('run-sequence');

module.exports = function(name, config, watch, taskPattern, mainTask) {

    var tasks = config.subtasks.map(function(task) {
        var taskName = name + ':' + task.name;
        taskPattern(taskName, task);
        return taskName;
    });

    if(watch[process.env.NODE_ENV]) {
        (config.watch || []).forEach(function(watch) {
            if(!watch.tasks) {
                gulp.watch(watch.src, [name]);
            } else {
                gulp.watch(watch.src, watch.tasks.map(function(task) {return name + ':' + task;}));
            }
        });
    }

    return function(cb) {
        if(cb) {
            if(mainTask) {
                mainTask(config, tasks, cb);
            } else {
                runSequence.use(gulp).call(null, tasks, cb);
            }
        } else {
            return tasks;
        }
    };
};
