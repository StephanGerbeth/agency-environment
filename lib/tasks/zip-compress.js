"use strict";

var gulp = require('gulp');
var upath = require('upath');
var zip = require('gulp-zip');
var taskGenerator = require('../taskGenerator');
var runSequence = require('run-sequence').use(gulp);

module.exports = function (name, config, serverConfig) {
    if (config) {
        return taskGenerator(name, config, serverConfig, function (taskName, task) {
            gulp.task(taskName, function () {
                return gulp.src(task.files.src)
                    .on('data', function (file) {
                        gulp.src([upath.join(upath.dirname(file.path), upath.basename(file.path), '**/*')].concat(task.excludes || []))
                            .pipe(zip(upath.basename(file.path) + '.zip'))
                            .pipe(gulp.dest(task.files.dest));
                    });
            });
        }, function (config, tasks, cb) {
            runSequence.call(null, tasks, function () {
                cb();
            });
        });
    }
};
