
module.exports = function transition(value) {
  value = value || "all 500ms ease";

  value = value.replace(/(\d+)ms/g, function (match, ms) {
    return ((ms / 1000) + 's').replace(/0\./g, '.');
  });
  return value;
};


module.exports.ms = function (value) {
  value = value.replace(/ease/g, '-ms-ease');
  value = value.replace(/(\d+)ms/g, function (match, ms) {
    return ((ms / 1000) + 's').replace(/0\./g, '.');
  });
  return value;
};


module.exports.$result = function () {
  var arg = '@{process_%vendor}' || 'all 0 ease 0';
  if (!/^\w*([ X])/.test(arg)) {
    arg = arg.replace(/,/g, '');
  }
  return arg;
};


module.exports.moz = false;
