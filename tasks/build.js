
module.exports = function (grunt) {
  var child_process = require('child_process');
  var exec = child_process.exec;

  grunt.registerTask('build', function () {
    var done = this.async();

    var proc = exec('node ./src/build.js > ./build/mixins.less');
    proc.stderr.on('data', function (chunk) {
      process.stderr.write(chunk);
    });
    proc.on('exit', function (code) {
      if (code !== 0) return done(false);

      console.log('> ./build/mixins.less');
      done(true);
    });
  });

};
