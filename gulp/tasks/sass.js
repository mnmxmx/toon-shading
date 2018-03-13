var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require('gulp-plumber');
var csswring = require('csswring');


gulp.task("css", function () {

  var postcss = require("gulp-postcss");
  var postcssOptions = [
    require('postcss-mixins'),
    require("autoprefixer")({ browsers: [
      'ie >= 9',
      'ie_mob >= 10',
      'ff >= 31',
      'chrome >= 36',
      'safari >= 8',
      'opera >= 23',
      'ios >= 8',
      'android >= 4'
    ]}),
    require("css-mqpacker")({ sort: function (a, b) { return b.localeCompare(a); } }),
    require("postcss-flexbugs-fixes"),
    require("postcss-partial-import")()
  ];

  postcssOptions.push(csswring);

  gulp.src("src/assets/css/styles.scss")
    .pipe(plumber())
    .pipe(sass({outputStyle: "expanded"}))
    .pipe(postcss(postcssOptions))
    .pipe(gulp.dest("dst/assets/css/"));
});