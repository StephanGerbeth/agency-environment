"use strict";

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var extname = require('gulp-extname');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error').postcss;
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, watch) {
    return taskGenerator(name, config, watch, function(taskName, task) {
        gulp.task(taskName, function() {
            return gulp.src(task.files.src)
                .on('error', errorHandler)
                .pipe(sourcemaps.init())
                .on('error', errorHandler)
                .pipe(extname('css'))
                .on('error', errorHandler)
                .pipe(postcss(require(task.config).plugins))
                .on('error', errorHandler)
                .pipe(sourcemaps.write('.'))
                .on('error', errorHandler)
                .pipe(gulp.dest(task.files.dest));
        });
        gulp.watch([task.files.dest + '/**/style.css'], function(file) {
            livereload.changed(file);
        });
    });
};
