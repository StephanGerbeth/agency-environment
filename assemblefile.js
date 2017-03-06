"use strict";

var template = require('lodash/template');
var upath = require('upath');
var options = require('minimist')(process.argv.slice(2));
var serverConfig = require(process.cwd() + options.serverConfig);
var tasksDir = options.gulpTaskConfig;

var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var livereload = require('gulp-livereload');


var watch = require(process.cwd() + tasksDir + 'watch/config');
gulp.task('watch', function(cb) {
    if(watch[process.env.NODE_ENV]) {
        livereload.listen(watch.config);
    }
    cb();
});

var glob = require('glob');
var files = glob.sync('**/map.json', {
    cwd: process.cwd() + tasksDir,
    root: '/',
    absolute: true
});
files.forEach(function(file) {
    createTask(getJSON(file));
});

gulp.task('purecss', require('./lib/tasks/purecss')(getJSON(process.cwd() + tasksDir + 'purecss/deprecated_map.json')));


gulp.task('build', function(callback) {
    runSequence('prebuild', 'webpack:app', ['validate', 'sitemap'], 'zip:default', callback);
});

gulp.task('prebuild', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'purecss'], 'postcss', 'handlebars', callback);
});

gulp.task('build-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'webpack:app', 'postcss'], 'handlebars', 'zip:banner', callback);
});

gulp.task('prebuild-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'postcss'], 'handlebars', callback);
});

function createTask(options) {
    gulp.task(options.name, require(options.task)(options.name, options.config, watch));
}

function getJSON(path) {
    return JSON.parse(template(JSON.stringify(require(path)))({'destination': upath.join(serverConfig.dest), 'root': upath.join(process.cwd())}));
}
