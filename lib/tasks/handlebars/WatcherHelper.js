"use strict";


var upath = require('upath');
var fs = require('fs');
var uniq = require('uniq');
require('colors');

var debug = false;

var regex_isHBS = new RegExp(/\.hbs$/);
var regex_isPKG = new RegExp(/(.*\/)((gp-boilerplate-.*)|(gp-module-.+))/);
var regex_partial = new RegExp(/\{\{?(mixin|extend|>) ["']([\-\w\/]+)["']/g);

var WatcherHelper = function() {
    this._isReady = false;
    this._watcher = null;

    // properties

    this.fileParentMap = {};
    this.changedFiles = null;


};
WatcherHelper.prototype.registerWatcher = function(watcher) {
    return watcher
        .on('change', this.onWatcherChange.bind(this))
        .on('ready', this.onWatcherReady.bind(this));
};
WatcherHelper.prototype.getRenderFiles = function(path) {
    var files = [path];
    (this.fileParentMap[path] || []).forEach(function(parent) {
        files = files.concat(this.getRenderFiles(parent));
    }.bind(this));
    return files;
};
WatcherHelper.prototype.getFiles = function(watched) {
    var files = [];
    for (var key in watched) {
        if (watched[key]) {
            for (var i = 0; i < watched[key].length; i++) {
                var path = watched[key][i];
                if (regex_isHBS.test(path)) {
                    files.push(path);
                }
            }
        }
    }
    return files;
};
WatcherHelper.prototype.resetChangedFiles = function() {
    this.changedFiles = [];
};

// EVENTS

WatcherHelper.prototype.onWatcherReady = function(watcher) {
    if (!this._isReady) {
        this._watcher = watcher;
        var files = [];
        // create File list
        this.getFiles(watcher.watched()).forEach(function(path) {
            var childs = addedParentsFromFile.bind(this)(path);
            var name = upath.relative(upath.join(watcher.options.cwd, watcher.options.base), path);
            files.push({
                path: path,
                name: name,
                childs: childs
            });
        }.bind(this));
        this._isReady = true;
        debugFileMap(this.fileParentMap);
    }
};

function getFilesFromPath(path, files) {
    files = files || [];
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function(file) {
            getFilesFromPath(upath.join(path, file), files);
        });
    } else {
        files.push(path);
    }
    return files;

}
WatcherHelper.prototype.onWatcherChange = function(data) {

    switch (data.type) {
        case 'renamed':
            // file renamed
            onRenamed.bind(this)(data);
            break;
        case 'changed':
            onChanged.bind(this)(data);
            break;
        case 'added':
            // new file added
            getFilesFromPath(data.path).forEach(function(file) {
                onAdded.bind(this)({
                    path: file
                });
            }.bind(this));
            break;
        case 'deleted':
            // file removed
            onDeleted.bind(this)(data);
            break;
    }

};

function addedParentsFromFile(path) {
    var watcher = this._watcher;
    var content = fs.readFileSync(path).toString();
    var result, childs = [];
    while ((result = regex_partial.exec(content)) !== null) {
        childs.push(result[2]);
    }
    uniq(childs);
    childs = childs.map(function(value) {
        var partial = 'partials/' + value + '.hbs';
        // Exclude PKG Partials
        if (!regex_isPKG.test(partial)) {
            return upath.join(watcher.options.cwd, watcher.options.base, partial);
        }
    });

    childs.forEach(function(child) {
        this.fileParentMap[child] = this.fileParentMap[child] || [];
        this.fileParentMap[child].push(path);
        uniq(this.fileParentMap[child]);
    }.bind(this));
    // Alte referenzierungen entfernen
    for (var key in this.fileParentMap) {
        if (this.fileParentMap[key] &&
            this.fileParentMap[key].indexOf(path) > -1 &&
            childs.indexOf(key) === -1) {
            // Eintrag existiert noch, wird aber nicht mehr benoetigt.
            this.fileParentMap[key].splice(this.fileParentMap[key].indexOf(path), 1);
        }
    }
    return childs;
}



/**
 * File Content Changed
 */
function onChanged(data) {
    addedParentsFromFile.bind(this)(data.path);
    var files = this.getRenderFiles(data.path);
    uniq(files);
    files = files.map(function(file) {
        return file;
    });
    this.changedFiles = files;
    console.log("changed files",files);
    debugFileMap(this.fileParentMap);
}

function onAdded(data) {
    debugFileMap(this.fileParentMap, 'From');
    addedParentsFromFile.bind(this)(data.path);
    debugFileMap(this.fileParentMap, 'To');
}

function onDeleted(data) {
    debugFileMap(this.fileParentMap, 'From');
    for (var key in this.fileParentMap) {
        if (this.fileParentMap[key]) {
            // console.log(key.bold.green);#
            if (this.fileParentMap[key].indexOf(data.path) > -1) {
                this.fileParentMap[key].splice(this.fileParentMap[key].indexOf(data.path), 1);
            }
        }
    }
    debugFileMap(this.fileParentMap, 'To');
}

function onRenamed(data) {
    debugFileMap(this.fileParentMap, 'From');
    addedParentsFromFile.bind(this)(data.path);
    debugFileMap(this.fileParentMap, 'To');
}

function debugFileMap(fileMap, title) {
    if (debug) {
        if (title) {
            console.log('-----------------------'.bold);
            console.log(title.bold);
        }
        for (var key in fileMap) {
            if (fileMap[key]) {
                console.log(key.bold.green);
                debugFileMapLogFiles(fileMap[key]);
            }
        }
        if (title) {
            console.log('-----------------------'.bold);
        }
    }
}

function debugFileMapLogFiles(fileMap) {
    fileMap.forEach(function(file) {
        console.log('File:'.bold.gray, file.bold.black);
    });
}


module.exports = WatcherHelper;
