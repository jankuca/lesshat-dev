
module.exports = function (grunt) {
  var child_process = require('child_process');
  var exec = child_process.exec;

  grunt.registerTask('test', function () {
    var done = this.async();

    var listTests = exec('find ./mixins -name test.js');
    var test_list_data = '';
    listTests.stdout.on('data', function (chunk) {
      test_list_data += chunk;
    });
    listTests.stderr.on('data', function (chunk) {
      process.stderr.write(chunk);
    });
    listTests.on('exit', function (code) {
      if (code !== 0) return done(false);

      var test_list = test_list_data.trim().split(/\r?\n/);
      var mocha_args = '-c -R spec -r ./src/test-env.js'.split(' ');
      mocha_args = mocha_args.concat(test_list);

      console.log('$ mocha ' + mocha_args.join(' '));

      var proc = exec('mocha ' + mocha_args.join(' '));
      proc.stdout.on('data', function (chunk) {
        process.stdout.write(chunk);
      });
      proc.stderr.on('data', function (chunk) {
        process.stdout.write(chunk);
      });
      proc.on('exit', function (code) {
        done(code === 0);
      });
    });
  });
};
