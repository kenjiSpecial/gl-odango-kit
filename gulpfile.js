var browserify = require('browserify');
var source = require("vinyl-source-stream");
var watchify = require('watchify');
var livereload = require('gulp-livereload');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var watch;

var entry = './example-liquid/example.js';
//var entry = './examples/texture-example00.js';

//var entry = './example-demo/example'
//entry = './src/main.js';


gulp.task('browserify-nowatch', function(){
    watch = false;
    browserifyShare();
});

gulp.task('browserify-watch', function(){
    watch = true;
    browserifyShare();
});

function browserifyShare(){
    console.log(entry);
    var b = browserify(entry);
    //b.add(entry);
    b.transform('browserify-shader');
    //console.log(b);

    if(watch) {
        b = watchify(b);
        b.on('update', function(){
            bundleShare(b);
        });
    }

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
