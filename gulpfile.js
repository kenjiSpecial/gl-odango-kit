var browserify = require('browserify');
var source = require("vinyl-source-stream");
var watchify = require('watchify');
var livereload = require('gulp-livereload');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var watch;

var entry = 'src/examples/texture-example00.js';

gulp.task('browserify-nowatch', function(){
    watch = false;
    browserifyShare();
});

gulp.task('browserify-watch', function(){
    watch = true;
    browserifyShare();
});

function browserifyShare(){
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    b.transform('browserify-shader');

    if(watch) {
        // if watch is enable, wrap this bundle inside watchify
        b = watchify(b);
        b.on('update', function(){
            bundleShare(b);
        });
    }

    b.add(entry);
    bundleShare(b);
}

function bundleShare(b) {
    b.bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.reload({stream:true}));

}


// define the browserify-watch as dependencies for this task
gulp.task('watch', ['browserify-watch'], function(){

    // Start live reload server
    return browserSync({ server:  { baseDir: './public' } });
});
