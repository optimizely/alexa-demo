const gulp = require('gulp');
const fs = require('fs');
const dir = './builds';
const zip = require('gulp-vinyl-zip');

gulp.task('default', function() {
  // place code for your default task here
  let numBuilds;

  fs.readdir(dir, (err, files) => {
    console.log(files.length);
    numBuilds = files.length;
    let destination = 'builds/alexa-v' + numBuilds + '.zip';
    console.log(destination);
    return gulp.src(['**/*', 'gulpfile.js', '!builds', '!builds/**'])
            .pipe(zip.dest(destination));
  });
  
});