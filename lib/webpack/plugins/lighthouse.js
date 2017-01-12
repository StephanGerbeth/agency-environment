"use strict";

var WebpackLighthousePlugin = require('webpack-lighthouse-plugin');

module.exports = function(webpack, config) {
    return new WebpackLighthousePlugin({
        url: 'http://localhost:8050'
    });
};
