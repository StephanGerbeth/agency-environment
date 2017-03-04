"use strict";

var gulp = require('gulp');
var taskGenerator = require('../taskGenerator');
var htmlv = require('gulp-html-validator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function () {
            return gulp.src(task.files.src)
                .pipe(htmlv({format: 'html'}))
                .pipe(gulp.dest(task.files.dest));
        });
    });
};
