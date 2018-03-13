var gulp = require("gulp");
var glslify = require("gulp-glslify");

// var path = "assets/test";


gulp.task("glsl", null, function() {
  gulp.src("src/**/*.{vert,frag}")
    .pipe(glslify())
    .pipe(gulp.dest("dst"));
});