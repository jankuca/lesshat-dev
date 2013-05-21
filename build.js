var fs = require('fs');
var path = require('path');
var LessGenerator = require('./less-generator');


var MIXIN_DIR = path.resolve('./mixins');
var OUTPUT_FILE = path.resolve('./build/mixins.less');


var mixin_keys = fs.readdirSync(MIXIN_DIR).sort();

var chunks = [];

mixin_keys.forEach(function (mixin_key) {
  var mixin_path = path.join(MIXIN_DIR, mixin_key, mixin_key + '.js');

  if (fs.existsSync(mixin_path)) {
    var mixin = require(mixin_path);
    var generator = new LessGenerator(mixin, mixin_key);

    chunks.push(generator.generate());
  }
});


console.log(chunks.join('\n\n'));
