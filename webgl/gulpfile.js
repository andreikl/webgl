var gulp = require('gulp');
var gutil = require('gulp-util');

// server
var livereload = require('connect-livereload');
var express = require('express');
var tinylr = require('tiny-lr');
var path = require('path');

// client
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

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
    app.use(livereload());
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

gulp.task('css', function () {
    return gulp.src(SRC_PATH + '/scss/main.scss')
        //.pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', gutil.log)
        //.pipe(plugins.sourcemaps.write(DEST_PATH + '/css'))
        .pipe(gulp.dest(DEST_PATH + '/css'))
});

gulp.task('default', ['js', 'css'], function() {
    gulp.watch([SRC_PATH + '/js/**/*'], function(evt) {
        gutil.log(gutil.colors.cyan(evt.path), ' is changed');
        gulp.run('js', function() {
        });
    });

    gulp.watch([SRC_PATH + '/scss/**/*'], function(evt) {
        gutil.log(gutil.colors.cyan(evt.path), ' is changed');
        gulp.run('css', function() {
        });
    });

    gulp.watch([DEST_PATH + '/**/*'], function(evt) {
        gutil.log(gutil.colors.cyan(evt.path), ' is changed');
        servers.lr.changed({
            body: {
                files: [evt.path]
            }
        });
        gutil.log('Server is restarted');
    });
});
