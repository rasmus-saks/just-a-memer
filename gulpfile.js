const gulp = require('gulp');
const zip = require('gulp-zip');
const webpack = require('webpack-stream');

gulp.task('js', function () {
    return gulp.src(['src/jam.ts', 'src/injector.ts'])
        .pipe(webpack(require('./webpack.config.js'), require('webpack')))
        .pipe(gulp.dest('extension/dist/'));
});

gulp.task('package', ['js'], function () {
    return gulp.src('extension/**')
        .pipe(zip('extension.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['js']);
