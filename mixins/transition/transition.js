
module.exports = function transition(value) {
  return value;
};


module.exports.ms = function (value) {
  return 'MS/' + value;
};


module.exports.$result = function () {
  var arg = '@{process_%vendor}' || 'all 0 ease 0';
  if (!/^\w*([ X])/.test(arg)) {
    arg = arg.replace(/,/g, '');
  }
  return arg;
};


module.exports.moz = false;
