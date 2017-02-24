"use strict";

var NpmInstallPlugin = require('npm-install-webpack-plugin');
module.exports = function(webpack, config) {
    console.log(webpack);
    return new NpmInstallPlugin(config);
};
