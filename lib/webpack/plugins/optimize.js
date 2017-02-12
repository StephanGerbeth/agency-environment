"use strict";

var OptimizeJsPlugin = require("optimize-js-plugin");

module.exports = function(webpack, config) {
    return new OptimizeJsPlugin(config);
};
