var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('default', function () {
    return gulp.src('index.js')
        .pipe($.browserify({standalone: 'ContainerModule'}))
        .pipe($.rename('ioc-js.js'))
        .pipe(gulp.dest('dist'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe(gulp.dest('dist'));
});