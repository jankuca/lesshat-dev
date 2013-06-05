var fs = require('fs');
var path = require('path');
var LessGenerator = require('./less-generator');


var MIXIN_DIR = path.resolve(__dirname, '../mixins');


var chunks = [];

var header_path = path.join(MIXIN_DIR, 'header.less');
if (fs.existsSync(header_path)) {
  var header = fs.readFileSync(header_path, 'utf8');
  chunks.push(header.trim());
}

var mixin_keys = fs.readdirSync(MIXIN_DIR).sort();
mixin_keys.forEach(function (mixin_key) {
  var mixin_path_noext = path.join(MIXIN_DIR, mixin_key, mixin_key);

  if (fs.existsSync(mixin_path_noext + '.less')) {
    var less = fs.readFileSync(mixin_path_noext + '.less', 'utf8');
    less = less.trim();

    chunks.push(less);
    return;
  }

  if (fs.existsSync(mixin_path_noext + '.js')) {
    var mixin = require(mixin_path_noext + '.js');
    var generator = new LessGenerator(mixin, mixin_key);

    chunks.push(generator.generate());
    return;
  }
});

var footer_path = path.join(MIXIN_DIR, 'footer.less');
if (fs.existsSync(footer_path)) {
  var footer = fs.readFileSync(footer_path, 'utf8');
  chunks.push(footer.trim());
}

console.log(chunks.join('\n\n'));
