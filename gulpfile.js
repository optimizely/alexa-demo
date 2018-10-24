const gulp = require('gulp');
const fs = require('fs');
const dir = './builds';
const zip = require('gulp-vinyl-zip');

gulp.task('default', function() {
  let numBuilds;
  
  if(!fs.existsSync(dir)){
    console.log('Builds dir doesn\'t exist. Creating builds dir now');
    fs.mkdirSync(dir)    
  }
  
  fs.readdir(dir, (err, files) => {
    numBuilds = files.length;
    
    console.log('Build Number: ', numBuilds);

    let destination = 'builds/alexa-v' + numBuilds + '.zip';
    console.log(destination);
    return gulp.src(['**/*', 'gulpfile.js', '!builds', '!builds/**'])
            .pipe(zip.dest(destination));
  });
  
});