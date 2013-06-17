var TestSuite = require('./test-suite');
var path = require('path');


var tester = new TestSuite();

var build_result_path = path.resolve(__dirname, '../build/mixins.less');
tester.addBuildResult(build_result_path);


global.test = tester;
