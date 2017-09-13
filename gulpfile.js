const gulp = require('gulp');
const cssc = require('gulp-css-condense');
const sass = require('gulp-ruby-sass');
const uglify = require('gulp-uglify-cli')

gulp.task('minifyjs', () =>
  gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
)

gulp.task('sass', () =>
  sass('sass/screen.scss')
    .on('error', sass.logError)
    .pipe(cssc())
    .pipe(gulp.dest('./dist/css'))
);

gulp.task('default', [ 'sass', 'minifyjs' ], function () {
  return
});