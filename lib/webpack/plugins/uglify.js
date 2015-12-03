"use strict";

module.exports = function(webpack) {
    return new webpack.optimize.UglifyJsPlugin({
        preserveComments: 'some',
        banner: '/*! Grunt Uglify <%= grunt.template.today("yyyy-mm-dd") %> */ ',
        screwIE8: true,
        compress: {
            sequences: true,
            properties: true,
            dead_code: true,
            drop_debugger: true,
            conditionals: true,
            comparisons: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            hoist_vars: false,
            if_return: true,
            join_vars: true,
            cascade: true,
            negate_iife: true,
            pure_getters: true,
            drop_console: true,
            warnings: true
        }
    });
};
