
module.exports = function (grunt) {
  grunt.registerTask('build', function () {
    var done = this.async();
    var exec = require('child_process').exec;

    var proc = exec('node ./src/build.js > ./build/mixins.less');
    proc.stderr.on('data', function (chunk) {
      console.error(String(chunk));
    });
    proc.on('exit', function (code) {
      done(code === 0);
    });
  });


  grunt.registerTask('default', [ 'build' ]);
};
