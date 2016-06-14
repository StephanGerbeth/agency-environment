"use strict";

var Handlebars = require('handlebars');
var create = Handlebars.create;

/**
 * Override Handlebars create for exclude yaml by template load.
 */
Handlebars.create = function() {
    var hb = create.apply(this, arguments);
    var compile = hb.precompile;
    hb.precompile = function() {
        arguments[0] = arguments[0].replace(/(---)[.\s\S]*(---)/g, '');
        return compile.apply(this, arguments);
    };
    return hb;
};

module.exports = Handlebars;
