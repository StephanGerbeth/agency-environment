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
            var pipe = gulp.src(task.files.src)
                .on('error', errorHandler);
            if (task.sourcemap) {
                pipe = pipe.pipe(sourcemaps.init());
            }
            pipe = pipe.on('error', errorHandler)
                .pipe(extname('css'))
                .on('error', errorHandler)
                .pipe(postcss(require(task.config).plugins))
                .on('error', errorHandler);
            if (task.sourcemap) {
                pipe = pipe.pipe(sourcemaps.write('.', {
                        sourceMappingURLPrefix: '/' + upath.relative(serverConfig.root, task.files.dest)
                    }))
                    .on('error', errorHandler);
            }
            return pipe.pipe(gulp.dest(task.files.dest));
        });
        gulp.watch([task.files.dest + '/**/style.css'], function(file) {
            livereload.changed(file);
        });
    });
};
