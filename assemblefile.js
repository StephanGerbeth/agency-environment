"use strict";

var template = require('lodash/string/template');
var options = require('minimist')(process.argv.slice(2));
var serverConfig = JSON.parse(template(JSON.stringify(require((process.cwd() + '/' + options.serverConfig || (process.cwd() + '/' + './env/config/local.json')))))({'root': process.cwd()}))[(options.env || 'development')];
var tasksConfig = JSON.parse(template(JSON.stringify(require(process.cwd() + '/' + options.configTasks)))({'destination': serverConfig.dest, 'root': process.cwd()}));

var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var livereload = require('gulp-livereload');

gulp.task('clean', require('./lib/tasks/clean')('clean', tasksConfig.clean, serverConfig));
gulp.task('copy', require('./lib/tasks/copy')('copy', tasksConfig.copy, serverConfig));
gulp.task('fontmin', require('./lib/tasks/fontmin')('fontmin', tasksConfig.fontmin, serverConfig));
gulp.task('handlebars', require('./lib/tasks/handlebars')('handlebars', tasksConfig.handlebars, serverConfig));
gulp.task('postcss', require('./lib/tasks/postcss')('postcss', tasksConfig.postcss, serverConfig));
gulp.task('purecss', require('./lib/tasks/purecss')(tasksConfig.purecss));
gulp.task('sitemap', require('./lib/tasks/sitemap')('sitemap', tasksConfig.sitemap, serverConfig));
gulp.task('webpack', require('./lib/tasks/webpack')('webpack', tasksConfig.webpack, serverConfig)());
gulp.task('watch', function(cb) {
    if(serverConfig.livereload) {
        livereload.listen({
            port: serverConfig.livereload.port
        });
    }
    cb();
});
gulp.task('zip-compress', require('./lib/tasks/zip-compress')('zip-compress', tasksConfig.zipcompress, serverConfig));

gulp.task('build', function(callback) {
    runSequence('prebuild', 'webpack:app', 'zip-compress:default', callback);
});

gulp.task('prebuild', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'purecss'], 'postcss', 'handlebars', ['sitemap'], callback);
});

gulp.task('build-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:app', 'postcss'], 'handlebars', 'zip-compress:banner', callback);
});

gulp.task('prebuild-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'postcss'], 'handlebars', callback);
});
