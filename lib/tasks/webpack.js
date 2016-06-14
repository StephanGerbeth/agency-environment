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
                .pipe(webpackStream({
                    entry: task.entry,
                    plugins: function() {
                        return task.plugins.map(function(plugin) {
                            return require(plugin.script)(webpack, plugin.config);
                        });
                    }(),
                    module: {
                        preLoaders: (task.module.preLoaders || []).map(convertLoader),
                        loaders: (task.module.loaders || []).map(convertLoader),
                        postLoaders: (task.module.postLoaders || []).map(convertLoader)
                    },
                    resolve: task.resolve,
                    output: {
                        filename: upath.basename(task.files.dest),
                        library:task.files.library
                    }
                }, null))
                .pipe(gulp.dest(upath.dirname(task.files.dest)));
        });
    });
};

function convertLoader(loader) {
    loader.test = new RegExp(loader.test);
    if(loader.exclude) {
        loader.exclude = new RegExp(loader.exclude);
    }
    if (loader.agency) {
        if (loader.agency.customs) {
            loader.agency.customs.forEach(function(custom) {
                require(custom);
            });
        }
    }
    return loader;
}
