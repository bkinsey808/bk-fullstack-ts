var gulp        = require('gulp');
var changed     = require('gulp-changed');
var watch       = require('gulp-watch');
var sass        = require('gulp-sass');
var runSequence = require('run-sequence');
var concatCss   = require('gulp-concat-css');

gulp.task('default', function(callback) {
  runSequence(['html:watch', 'sass:watch'], // run these in parallel
              callback);
});

gulp.task('html', function () {
    return gulp.src('src/**/*.html')
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'));
});

gulp.task('html:watch', function () {
    return gulp.watch('src/**/*.html', ['html']);
});

gulp.task('sass', function () {
  return gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('app.css'))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('sass:watch', function () {
  return gulp.watch('src/**/*.scss', ['sass']);
});
