var gulp = require("gulp");
var changed = require("gulp-changed");
var concat = require("gulp-concat");
var runSequence = require('run-sequence');
var stripDebug = require('gulp-strip-debug');
var babel = require('gulp-babel');
var plumber  = require('gulp-plumber');



gulp.task("js", function(){
  return runSequence(
    "js.concat"
  );
});


gulp.task("js.concat", function(){
  return gulp.src([
    "src/assets/js/lib-head/*.js",
    "src/assets/js/lib/*.js",
    "src/assets/js/module/*.js",
    "src/assets/js/main.js"
    ],
    { base: "src" }
    )
    .pipe(plumber())
    .pipe(babel())
    .pipe(concat("main.min.js"))
    .pipe(gulp.dest("dst/assets/js/"));
})
