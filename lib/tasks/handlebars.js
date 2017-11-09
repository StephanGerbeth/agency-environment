"use strict";

var app = require('../assemble/config');
var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var extname = require('gulp-extname');
var controller = require('../assemble/plugins/controller.js');
var errorHandler = require('../assemble/plugins/error').handlebars;
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

var WatcherHelper = require('./handlebars/WatcherHelper');
var micromatch = require("micromatch");

module.exports = function(name, config, server) {

    app.option("assets", config.assets);

    gulp.task('handlebars_update', function() {
        app.layouts(config.layouts.files.src, config.layouts.options);
        app.partials(config.partials.files.src, config.partials.options);
        app.data(config.globals.files.src, {
            namespace: function(filename, options) {
                return upath.relative(options.cwd, filename).replace(upath.extname(filename), '').replace(/\//g, '.');
            },
            cwd: config.globals.files.cwd
        });
    });

    return taskGenerator(name, config, server, function(taskName, task, watcher) {

        if (task.partialRendering && watcher) {
            // Register WatcherHelper for partial file rendering
            var watcherHelper = new WatcherHelper();
            watcherHelper.registerWatcher(watcher);
        }

        gulp.task(taskName, function() {

            if (task.data) {
                app.data(task.data.src, {
                    namespace: function(filename, options) {
                        return upath.relative(options.cwd, filename).replace(upath.extname(filename), '');
                    },
                    cwd: task.data.cwd
                });
            }

            app.create(task.name).use(function() {
                return function(view) {

                    if (!view.layout) {
                        view.layout = task.layout;
                    }
                };
            });

            if (task.partialRendering && watcherHelper && watcherHelper.changedFiles && watcherHelper.changedFiles.length > 0) {
                var src = micromatch(watcherHelper.changedFiles.map(function(file) {
                    return './' + upath.relative(process.cwd(), file);
                }), task.files.src).map(function(file) {
                    return upath.relative(upath.join(task.partialRendering.options.cwd), file);
                });
                watcherHelper.resetChangedFiles();
                app[task.name](src, {
                    base: task.partialRendering.options.base || '',
                    cwd: task.partialRendering.options.cwd
                });
            } else {
                app[task.name](task.files.src, {
                    base: task.files.base
                });
            }

            return app.toStream(task.name)
                .pipe(app.renderFile(getData(config.scripts, server, config.fonts)))
                .on('error', errorHandler)
                .pipe(extname())
                .on('error', errorHandler)
                // .pipe(changed(task.files.dest, {hasChanged: changed.compareSha1Digest}))
                .on('error', errorHandler)
                .pipe(app.dest(task.files.dest))
                .on('error', errorHandler);
                    });

    }, function(config, tasks, cb) {
        controller.reset();
        runSequence.call(null, ['handlebars_update'].concat(tasks), function() {
            registerController(config.registerController).then(function() {
                livereload.changed('all');
                cb();
            });
        });
    });
};

function registerController(options) {
    return new Promise(function(resolve) {
        gulp.src(options.src)
            .on('data', controller.collectFromFile())
            .on('end', function() {
                controller.createRegistry(null,resolve);
            })
            .on('error', errorHandler);
    });
}

function getData(scripts, server, fonts) {
    return {
        options: {
            server: server,
            scripts: scripts,
            fonts: fonts
        }
    };
}
