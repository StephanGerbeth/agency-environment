"use strict";

var gulp = require('gulp');
var upath = require('upath');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var extname = require('gulp-extname');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error').postcss;
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function() {
            return gulp.src(task.files.src)
                .on('error', errorHandler)
                .pipe(sourcemaps.init())
                .on('error', errorHandler)
                .pipe(extname('css'))
                .on('error', errorHandler)
                .pipe(postcss(task.plugins.map(function(plugin) {
                    return require(plugin.name).apply(null, plugin.params);
                })))
                .on('error', errorHandler)
                .pipe(sourcemaps.write('.', {sourceMappingURLPrefix: '/' + upath.relative(serverConfig.root, task.files.dest)}))
                .on('error', errorHandler)
                .pipe(gulp.dest(task.files.dest));
        });
        gulp.watch([task.files.dest + '/**/style.css'], function(file) {
            livereload.changed(file);
        });
    });
};
