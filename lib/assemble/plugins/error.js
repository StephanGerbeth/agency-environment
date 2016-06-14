'use strict';

var notify = require('gulp-notify');
var gutil = require('gulp-util');

module.exports = {
    handlebars: function (error) {

        notifyOS('handlebars', error.view.relative, error);
        report(error.view.relative, error.reason);
        
        this.emit('end');
    },

    postcss: function(error) {
        var fail = error.message.split(': ');

        notifyOS(error.plugin, fail[0], error);
        report(fail[0], fail[1]);

        this.emit('end');
    }
};

function notifyOS(plugin, file, error) {
    notify({
        title: 'task failed: ' + plugin,
        message: file + '... - See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);
}

function report(file, reason) {
    var log = '';
    var chalk = gutil.colors.white.bgRed;
    log += chalk('FILE:') + ' ' + file + '\n';
    log += chalk('PROB:') + ' ' + reason + '\n';
    console.error(log);
}
