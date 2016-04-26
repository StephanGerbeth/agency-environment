"use strict";

var assemble = require('assemble')();
var upath = require('upath');
var merge = require('mixin-deep');
var engine = require('engine-handlebars');

assemble.engine('hbs', engine);

engine.Handlebars.registerHelper(require('template-helpers')());
// engine.Handlebars.registerHelper(layouts(engine.Handlebars));

assemble.helper('mixin', require('../handlebars/helpers/mixin')(engine.Handlebars, assemble));
assemble.asyncHelper('doc', require('../handlebars/helpers/doc')(assemble));
assemble.asyncHelper('raw', require('../handlebars/helpers/raw'));
assemble.asyncHelper('glob', require('../handlebars/helpers/glob'));
// assemble.asyncHelper('test', require('../handlebars/helpers/test'));

assemble.option('renameKey', function(filename, content, options) {
    if(upath.extname(filename) === '.json') {
        return options.namespace(filename, options);
    }
    return filename;
});

assemble.partials.option('renameKey', function(fp, view) {
    if(view) {
        return upath.relative(view.base, fp).replace(upath.extname(fp), '');
    }
    return fp;
});
assemble.layouts.option('renameKey', function(fp, view) {
    if(view) {
        return upath.relative(view.base, fp).replace(upath.extname(fp), '');
    }
    return fp;
});

assemble.preRender(/\.hbs$/, mergeContext(assemble));

function mergeContext(app, locals) {
  return function(view, next) {
      var key = view.relative.replace(upath.extname(view.relative), '');
      view.layout = view.data.layout || view.layout;
      view.data = merge({
          relativeToRoot: getRelativeToRoot(view),
          partial: key.replace('partials/', '')
      }, locals, view.data, app.cache.data[key] || {});
    next();
  };
}

function getRelativeToRoot(view) {
    var relativeToRoot = upath.relative(upath.dirname(view.key), view.base).replace(upath.extname(view.key), '');
    if(relativeToRoot !== '') {
        return relativeToRoot;
    } else {
        return '.';
    }
}

module.exports = assemble;
