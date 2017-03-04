"use strict";

var template = require('lodash/template');
var upath = require('upath');
var options = require('minimist')(process.argv.slice(2));
var serverConfig = require(process.cwd() + options.serverConfig);
var gulpFileMap = JSON.parse(template(JSON.stringify(require(upath.join(process.cwd(), options.gulpFileMap))))({'destination': upath.join(serverConfig.dest), 'root': upath.join(process.cwd())}));

var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var livereload = require('gulp-livereload');
var watch = require(gulpFileMap.watch.config);

gulp.task('clean', require('./lib/tasks/clean')('clean', gulpFileMap.clean, watch));
gulp.task('copy', require('./lib/tasks/copy')('copy', gulpFileMap.copy, watch));
gulp.task('fontmin', require('./lib/tasks/fontmin')('fontmin', gulpFileMap.fontmin, watch));
gulp.task('handlebars', require('./lib/tasks/handlebars')('handlebars', gulpFileMap.handlebars, watch, serverConfig));
gulp.task('postcss', require('./lib/tasks/postcss')('postcss', gulpFileMap.postcss, watch, serverConfig.root));
gulp.task('purecss', require('./lib/tasks/purecss')(gulpFileMap.purecss));
gulp.task('sitemap', require('./lib/tasks/sitemap')('sitemap', gulpFileMap.sitemap, watch));
gulp.task('validate', require('./lib/tasks/validate')('validate', gulpFileMap.validate, watch)());
gulp.task('webpack', require('./lib/tasks/webpack')('webpack', gulpFileMap.webpack, watch)());
gulp.task('watch', function(cb) {
    if(watch[process.env.NODE_ENV]) {
        livereload.listen(watch.config);
    }
    cb();
});
gulp.task('zip-compress', require('./lib/tasks/zip-compress')('zip-compress', gulpFileMap.zipcompress, watch));

gulp.task('build', function(callback) {
    runSequence('prebuild', 'webpack:app', ['validate', 'sitemap'], 'zip-compress:default', callback);
});

gulp.task('prebuild', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'purecss'], 'postcss', 'handlebars', callback);
});

gulp.task('build-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'webpack:app', 'postcss'], 'handlebars', 'zip-compress:banner', callback);
});

gulp.task('prebuild-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'postcss'], 'handlebars', callback);
});
