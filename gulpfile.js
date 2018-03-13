var gulp = require('gulp');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');


requireDir('./gulp/tasks');


// 開発watch
gulp.task('watch', function(){
  // gulp.watch('src/assets/img/mobile/topic/*.png', ["sprite"]);
  gulp.watch(['src/assets/css/**/*.{scss,css}'], ['css']);
  gulp.watch('src/assets/js/**/*.js', ['js']);
  gulp.watch('src/assets/glsl/**/*.{vert,frag}', ['glsl']);
  gulp.watch('src/**/*.html', ['html']);
  // gulp.watch(['src/assets/img/**/*.{png,jpg,jpeg,gif,svg}', 'src/assets/video/**/*.webm'], ['img']);
});


// 開発task
gulp.task('predefault', function(){
  runSequence(
    'css',
    'html',
    'glsl',
    'js',
    // 'img',
    'browserSync',
    'watch'
  );
});


// srcからdstへ（開発用）... dstへファイルを上書きする
gulp.task('default', ['predefault'], function(){
  console.log('running default tasks...');
});