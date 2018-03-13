var gulp     = require('gulp');
var plumber  = require('gulp-plumber');


gulp.task('html', function()
{

  gulp.src("src/**/*.html")
    .pipe(gulp.dest("dst"));
});