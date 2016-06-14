"use strict";

var gulp = require('gulp');
var upath = require('upath');
var fontmin = require('gulp-fontmin');
var taskGenerator = require('../taskGenerator');
var runSequence = require('run-sequence').use(gulp);

module.exports = function(name, config, serverConfig) {
    if(config) {
        return taskGenerator(name, config, serverConfig, function(taskName, task) {
            gulp.task(taskName, function () {
                return gulp.src(task.files.src)
                    .on('data', function(file) {
                        var src = upath.join(upath.dirname(file.path), '/**/*.{svg,eot,woff,ttf}');
                        var text = file.contents.toString('utf-8');
                        var dest = upath.join(task.files.dest, upath.dirname(file.relative));
                        minifyFont(src, dest, text);

                    });
            });
        }, function(config, tasks, cb) {
            runSequence.call(null, tasks, function() {
                cb();
            });
        });
    }
};

function minifyFont(src, dest, text) {
    gulp.src(src)
        .pipe(fontmin({
            text: text
        }))
        .pipe(gulp.dest(dest));
}
