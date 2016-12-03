"use strict";

var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function(webpack, config) {
    return new BundleAnalyzerPlugin(config);
};
