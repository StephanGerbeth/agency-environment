"use strict";

var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var upath = require('upath');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function() {
            return gulp.src(task.files.src)
                .pipe(webpackStream(Object.assign({
                    entry: task.entry,
                    output: {
                        path: process.cwd() + '/' + upath.dirname(task.files.dest),
                        filename: upath.basename(task.files.dest),
                        library:task.files.library,
                        publicPath: task.files.publicPath || '/',
                        chunkFilename: task.files.chunkFilename || '[id].js'
                    }
                }, require(task.config)(task.name)), webpack))
                .pipe(gulp.dest(upath.dirname(task.files.dest)));
        });
    });
};
