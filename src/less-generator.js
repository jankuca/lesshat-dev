var UglifyJS = require('uglify-js');


var LessGenerator = function (mixin, mixin_key) {
  this.mixin = mixin;
  this.mixin_key = mixin_key || mixin.name;

  if (!this.mixin_key) {
    throw new Error('No mixin key specified');
  }

  this.vendors = Object.keys(LessGenerator.prefixes);
  this.fns = this.getFunctionMap();
};


LessGenerator.prefixes = {
  webkit: '-webkit-',
  moz: '-moz-',
  opera: '-o-',
  ms: '-ms-',
  w3c: ''
};


LessGenerator.fixArguments = function () {
  return "@{arguments}".replace(/^\[|\]$/g, "");
};


LessGenerator.fixArguments_ = function (input) {
  var fixer = LessGenerator.fixArguments.toString();
  fixer = LessGenerator.uglifyFunction(fixer);
  fixer = fixer.replace(/^function\([^)]*\)\{return/, '');
  fixer = fixer.replace(/\}$/, '');
  return fixer;
};

LessGenerator.signals = {
  webkit: 1,
  moz: 2,
  opera: 3,
  ms: 4,
  w3c: 5
};


LessGenerator.generateGlobalToggles = function () {
  var vendors = Object.keys(LessGenerator.prefixes);

  var chunks = [];
  vendors.forEach(function (vendor) {
    chunks.push('@' + vendor + ': true;');
  });

  return chunks.join('\n');
};


LessGenerator.prototype.getFunctionMap = function () {
  var mixin = this.mixin;

  var fns = {};
  this.vendors.forEach(function (vendor) {
    var fn = mixin[vendor];
    if (fn !== false && fn !== null) {
      fns[vendor] = fn || mixin;
    }
  });

  return fns;
};


LessGenerator.prototype.generate = function () {
  var chunks = [
    '.' + this.mixin_key + '(...) {',
    this.generateLocalToggles_(),
    this.generateBodies_(),
    this.generateResults_(),
    '}'
  ];

  return chunks.join('\n\n');
};


LessGenerator.prototype.generateLocalToggles_ = function () {
  var mixin = this.mixin;
  var fns = this.fns;

  var chunks = [];
  Object.keys(fns).forEach(function (vendor) {
    chunks.push('  @' + vendor + '_local: true;');
  });

  return chunks.join('\n');
};


LessGenerator.prototype.generateBodies_ = function () {
  var mixin = this.mixin;
  var fns = this.fns;

  var chunks = [];
  Object.keys(fns).forEach(function (vendor) {
    var fn = fns[vendor];
    var args = LessGenerator.fixArguments_("@{arguments}");
    var js = LessGenerator.uglifyFunction(fn);
    js = '(' + js + ')(' + args + ')';
    js = js.replace(/`/g, '\\`');

    chunks.push('  ' +
      '@process_' + vendor + ': ~`' + js + '`;'
    );
  });

  return chunks.join('\n');
};


LessGenerator.prototype.generateResults_ = function () {
  var chunks = [];
  chunks.push(this.generateResultDefinitions_());
  chunks.push(this.generateResultCalls_());

  return chunks.join('\n\n');
};


LessGenerator.prototype.generateResultDefinitions_ = function () {
  var chunks = [];
  chunks.push(this.generatePrimaryResultDefinition_());
  chunks.push(this.generateSecondaryResultDefinition_());

  return chunks.join('\n');
};


LessGenerator.prototype.generatePrimaryResultDefinition_ = function () {
  var fns = this.fns;
  var prefixes = LessGenerator.prefixes;

  var chunks = [];

  // open .result() definition
  chunks.push('  ' +
    '.result (@arguments, @signal, @boolean, @local_boolean)' +
    ' when (@boolean = true)' +
    ' and (@local_boolean = true)' +
    ' {'
  );

  Object.keys(fns).forEach(function (vendor) {
    chunks.push('    ' + this.generateVendorResultInceptionJS_(vendor));
  }, this);

  chunks.push('    ' +
    '.inception (@signal, @arguments)' +
    ' when (@signal > 5),(@signal < 1)' +
    ' { ' +
    'error: "Signal is out of range";' +
    ' }'
  );
  chunks.push('    ' +
    '.inception(@signal, @arguments);'
  );

  // close .result() definition
  chunks.push('  }');

  return chunks.join('\n');
};


LessGenerator.prototype.generateVendorResultInceptionJS_ = function (vendor) {
  var prefix = LessGenerator.prefixes[vendor];
  var signal = Object.keys(LessGenerator.prefixes).indexOf(vendor) + 1;

  var result = '%{process_' + vendor + '}';
  if (this.mixin.$result) {
    var js = this.mixin.$result.toString();
    js = js.replace(/%vendor/g, vendor);
    js = LessGenerator.uglifyFunction(js);
    js = '(' + js + ')("@{arguments}")'
    js = js.replace(/`/g, '\\`');

    result = '~`' + js.replace(/`/g, '\\`') + '`;';
  }

  return '.inception (@signal, @arguments)' +
    ' when (@signal = ' + signal + ')' +
    ' { ' +
    prefix + this.mixin_key + ': ' + result +
    ' }';
};


LessGenerator.prototype.generateSecondaryResultDefinition_ = function () {
  var chunks = [];

  chunks.push('  ' +
    '.result (@arguments, @signal, @boolean, @local_boolean)' +
    ' when not (@boolean = true), not (@local_boolean = true)' +
    ' {}'
  );

  return chunks.join('\n');
};


LessGenerator.prototype.generateResultCalls_ = function () {
  var fns = this.fns;

  var chunks = [];
  Object.keys(fns).forEach(function (vendor) {
    var signal = Object.keys(LessGenerator.prefixes).indexOf(vendor) + 1;

    chunks.push('  .result(@arguments, ' + signal + ', @' + vendor + ', @' + vendor + '_local);');
    chunks.push('  // --'); // this comment must be here because of LESS bug
  });

  return chunks.join('\n');
};



LessGenerator.uglify_options = {};


LessGenerator.uglifyFunction = function (js) {
  js = js.toString();
  js = '(' + js + ')()';

  var ast = UglifyJS.parse(js);
  var compressor = UglifyJS.Compressor(LessGenerator.uglify_options);

  ast.figure_out_scope();
  ast = ast.transform(compressor);

  var result = ast.print_to_string();
  result = result.replace(/^!/, '').replace(/\(\);$/, '');
  return result;
};



module.exports = LessGenerator;
