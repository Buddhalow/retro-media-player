var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var gulp = require('gulp');
var fontName = 'roamnia';
/*
gulp.task('iconfont', function(){
  gulp.src(['assets/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'assets/css/templates/_roamnia.css',
      targetPath: 'client/css/roamnia.css',
      fontPath: 'client/fonts/'
    }))
    .pipe(iconfont({
      fontName: fontName
     }))
    .pipe(gulp.dest('client/fonts/'));
});*/