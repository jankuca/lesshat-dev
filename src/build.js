var fs = require('fs');
var path = require('path');
var LessGenerator = require('./less-generator');
var MixinLoader = require('./mixin-loader');


var parent_dirname = path.resolve(__dirname, '..', '..', '..');
var mixin_dirname = path.join(parent_dirname, 'mixins');


var chunks = [];

var header_path = path.join(mixin_dirname, 'header.less');
if (fs.existsSync(header_path)) {
  var header = fs.readFileSync(header_path, 'utf8');
  chunks.push(header.trim());
}


chunks.push(LessGenerator.generateGlobalToggles());

var loader = new MixinLoader(mixin_dirname);
var mixin_descs = loader.getMixinDescriptors();

mixin_descs.forEach(function (desc) {
  switch (desc.type) {
  case 'less':
    var less = fs.readFileSync(desc.path, 'utf8');
    less = less.trim();
    chunks.push(less);
    break;

  case 'js':
    var mixin = require(desc.path);
    var generator = new LessGenerator(mixin, desc.key);

    chunks.push(generator.generate());
    break;
  }
});


var footer_path = path.join(mixin_dirname, 'footer.less');
if (fs.existsSync(footer_path)) {
  var footer = fs.readFileSync(footer_path, 'utf8');
  chunks.push(footer.trim());
}


console.log(chunks.join('\n\n'));
