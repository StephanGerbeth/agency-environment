"use strict";

var fs = require('fs');
require.extensions['.css'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var upath = require('upath');
var beautify = require('js-prettify');
var template = require('./doc/template.hbs');
var cssmin = require('cssmin');
var hljs = require('highlight.js');
hljs.configure({useBR: true});

module.exports = function(assemble){
    return function(options, cb) {
        assemble.engine('.hbs').render(options.fn(), options.data.root, function(err, html) {
          if (err) {
            return cb(err);
          }

          var tmpl = template({
              preview: html,
              style: cssmin(require('highlight.js/styles/github.css')),
              code: {
                  html: hljs.highlightAuto(beautifyHTML(html.trim()), ['html', 'xml']).value,
                  hbs: hljs.highlightAuto(options.fn().trim(), ['handlebars']).value,
                  json: hljs.highlightAuto(getJSONContent(assemble, options), ['json']).value
              },
              info: getRelatedPartials(assemble, options)
          });
          cb(null, tmpl);
        });
    };
};

function beautifyHTML(str) {
    return beautify.html(str, {
        indent_inner_html: true,
        indent_handlebars: true,
        condense: false,
        padcomments: false,
        indent: 1,
        unformatted: ["a", "sub", "sup", "b", "i", "u", "script"]
    });
}

function getJSONContent(assemble, options) {
    var partial = assemble.views.partials[options.data.root.partial];

    if(partial) {
        var data = assemble.views.partials[options.data.root.partial].context();
        return beautify.js(JSON.stringify(data));
    } else {
        return false;
    }

}

function getRelatedPartials(assemble, options) {
    var list = [], m, re = /\{\{?[\{#](mixin|extend|\>)[\s\"]+([\-\w\/]+)/g;
    while ((m = re.exec(options.fn())) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var partial = assemble.views.partials[m[2]];

        var partialURI = upath.join(partial.base, options.data.root.partial);
        var relatedPartialURI = upath.join(partial.base, partial.relative);
        var relativePath = upath.relative(upath.dirname(partialURI), relatedPartialURI.replace(upath.extname(relatedPartialURI), '.html'));

        list.push({title: partial.key, url: relativePath});
    }
    return list;
}
