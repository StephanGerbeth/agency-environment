"use strict";

var app = require('../assemble/config');
var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var extname = require('gulp-extname');
var registry = require('../assemble/plugins/registry.js');
var errorHandler = require('../assemble/plugins/error').handlebars;
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');



module.exports = function(name, config, watch) {

    app.option("assets", config.options.assets);

    gulp.task('handlebars_update', function() {
        app.layouts(config.options.layouts.files.src, config.options.layouts.options);
        app.partials(config.options.partials.files.src, config.options.partials.options);
        app.data(config.options.globals.files.src, {
            namespace: function(filename, options) {
                return upath.relative(options.cwd, filename).replace(upath.extname(filename), '').replace(/\//g, '.');
            },
            cwd: config.options.globals.files.cwd
        });
    });

    return taskGenerator(name, config, watch, function(taskName, task) {

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

            app[task.name](task.files.src, {
                base: task.files.base
            });

            var stream = app.toStream(task.name)
                .pipe(app.renderFile(getData(watch, config.resources, config.fonts)))
                .on('error', errorHandler)
                .pipe(extname())
                .on('error', errorHandler);

            require(task.config).forEach(function(item) {
                if (item[process.env.NODE_ENV]) {
                    stream.pipe(item.module).on('error', errorHandler);
                }
            });

            return stream.pipe(app.dest(task.files.dest))
                .on('error', errorHandler)
                .pipe(registry.collect())
                .on('error', errorHandler);
        });

    }, function(config, tasks, cb) {
        registry.reset();
        runSequence.call(null, ['handlebars_update'].concat(tasks), function() {
            livereload.changed('all');
            registry.createRegistry(config.controllerRegistry).then(function(){
                cb();
            });
        });
    });
};

function getData(watch, resources, fonts) {
    return {
        options: {
            watch: {
                status: watch[process.env.NODE_ENV],
                config: watch.config
            },

            resources: resources,
            fonts: fonts
        }
    };
}
