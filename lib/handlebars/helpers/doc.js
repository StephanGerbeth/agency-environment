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
          var jsonContent = getJSONContent(assemble, options.data.root.partial);
          var docsContent = iterateJSONContentByRef(assemble, jsonContent, 'docs');
          var dataContent = iterateJSONContentByRef(assemble, jsonContent, 'data');

          var tmpl = template({
              preview: html,
              style: cssmin(require('highlight.js/styles/github.css')),
              code: {
                  html: hljs.highlightAuto(beautifyHTML(html.trim()), ['html', 'xml']).value,
                  hbs: hljs.highlightAuto(options.fn().trim(), ['handlebars']).value,
                  json: hljs.highlightAuto(beautifyJS(dataContent || JSON.stringify(jsonContent)), ['json']).value,
                  refs: hljs.highlightAuto(beautifyJS(docsContent || ''), ['json']).value
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

function beautifyJS(data) {
    return beautify.js(data);
}

function getJSONContent(assemble, path) {
    var partialName = upath.join(path).replace('partials/', '');
    var partial = assemble.views.partials[partialName];

    if(partial) {
        return assemble.views.partials[partialName].context();
    } else {
        return {};
    }
}

function iterateJSONContentByRef(assemble, content, key) {
    if(content[key]) {
        var string = JSON.stringify(content[key]);
        return string.replace(/\1([\'\"]+ref:)+\2([a-zA-Z0-9\/-_]+)\"/gm, function(source, prefix, value) {
            var content = getJSONContent(assemble, value);
            return iterateJSONContentByRef(assemble, content || {}, key);
        });
    } else {
        return null;
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
