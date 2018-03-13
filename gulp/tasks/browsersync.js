var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browserSync', function(){
  browserSync({
    open: 'external',
    reloadDebounce: 2000,
    ui: false,
    notify: false,
    startPath: "/",
    ghostMode: false,
    server: {
      baseDir: "dst/"
    },
    files: [
      "dst/**/*.obj",

      "dst/**/*.json",
      "dst/**/*.xml",

      "dst/**/*.mp4",
      "dst/**/*.webm",
      "dst/**/*.mp3",

      "dst/**/*.png",
      "dst/**/*.jpg",
      "dst/**/*.gif",
      "dst/**/*.svg",

      "dst/**/*.frag",
      "dst/**/*.vert",

      "dst/**/*.html",
      "dst/**/*.css",
      "dst/**/*.js"
    ]
  });
});