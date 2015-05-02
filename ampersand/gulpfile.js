var gulp = require('gulp');
var gutil = require('gulp-util');

// server
var express = require('express');
var tinylr = require('tiny-lr');
var path = require('path');

// client
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var SRC_PATH = path.resolve('./src');
var DEST_PATH = path.resolve('./dest');
gutil.log(gutil.colors.cyan('SRC_PATH:'), SRC_PATH);
gutil.log(gutil.colors.cyan('DEST_PATH:'), DEST_PATH);

var createServers = function(port, lrport) {
    var lr = tinylr();
    lr.listen(lrport, function() {
        gutil.log('LR Listening on', lrport);
    });

    var app = express();
    //app.use(livereload());
    app.use(express.static(DEST_PATH));
    app.listen(port, function() {
        gutil.log('Listening on', port);
    });
 
    return {
        lr: lr,
        app: app
    };
};
 
var servers = createServers(8080, 35729);

gulp.task('js', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: SRC_PATH + '/js/main.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('./main.js'))
        .pipe(buffer())
        //.pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(uglify())
        .on('error', gutil.log)
        //.pipe(sourcemaps.write(DEST_PATH + '/js'))
        .pipe(gulp.dest(DEST_PATH + '/js'));
});

gulp.task('default', ['js'], function() {
    gulp.watch(["./**/*", "!./node_modules/**/*"], function(evt) {
        gutil.log(gutil.colors.cyan(evt.path), 'changed');
        //servers.lr.changed({
        //    body: {
        //        files: [evt.path]
        //    }
        //});
    });
});
