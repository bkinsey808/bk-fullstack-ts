var gulp        = require('gulp');
var changed     = require('gulp-changed');
var watch       = require('gulp-watch');
var sass        = require('gulp-sass');
var runSequence = require('run-sequence');
var concatCss   = require('gulp-concat-css');
var ts          = require('gulp-typescript');
var rename      = require("gulp-rename");

gulp.task('default', function(callback) {
  runSequence(
    [
      'build',
      'watch'
    ],
    callback);
});

// BUILD SECTION

gulp.task('build', function(callback) {
  return runSequence(
    [
      'html',
      'sass',
      'clientJavaScript', // currently only for jspm_config.js
      'clientTypeScript',
      'serverTypeScript'
    ],
    callback);
});

gulp.task('html', function () {
  return gulp.src('src/client/**/*.html')
    .pipe(changed('dist/public'))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('sass', function () {
  return gulp.src('src/client/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('build.css'))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('clientJavaScript', function () {
  return gulp.src('src/client/**/*.js', {
      base: 'src/client'
    })
    .pipe(gulp.dest('dist/public'));
});

gulp.task('clientTypeScript', function () {
  return gulp.src('src/client/**/*.ts')
    .pipe(ts({
      module: 'commonjs',
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      target: 'es5'
    })).js
    .pipe(gulp.dest('dist/public'));
});

gulp.task('serverTypeScript', function () {
  return gulp.src('src/server/**/*.ts', {
      base: 'src/server'
    })
    .pipe(ts({
      module: 'commonjs',
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      target: 'es5'
    })).js
    // I'm not sure why this rename is necessary.
    // For some reason gulp-typescript makes the path to be the
    // path of the whole project in my testing, and I haven't
    // seen an obvious config option to get the behavior I want.
    //    .pipe(rename(function (path) {
//      path.dirname = '';
//    }))
    .pipe(gulp.dest('dist'));
});

// WATCH SECTION

gulp.task('watch', function(callback) {
  return runSequence(
    [
      'html:watch',
      'sass:watch',
      'clientJavaScript:watch', // currently only for jspm_config.js
      'clientTypeScript:watch',
      'serverTypeScript:watch'
    ],
    callback);
});

gulp.task('html:watch', function () {
  return gulp.watch('src/client/**/*.html', ['html']);
});

gulp.task('sass:watch', function () {
  return gulp.watch('src/client/**/*.scss', ['sass']);
});

gulp.task('clientJavaScript:watch', function () {
  return gulp.watch('src/client/**/*.js', ['clientJavaScript']);
});

gulp.task('clientTypeScript:watch', function () {
  return gulp.watch('src/client/**/*.ts', ['clientTypeScript']);
});

gulp.task('serverTypeScript:watch', function () {
  return gulp.watch('src/server/**/*.ts', ['serverTypeScript']);
});
