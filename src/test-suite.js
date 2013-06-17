var assert = require('assert');
var fs = require('fs');
var less = require('less');


var TestSuite = function () {
  this.build_results_ = [];
  this.build_result_contents_ = '';

  this.mixin_keys_ = [];
  this.setter_keys_ = [];
};


// We are defining the methods via Object.defineProperty/ies for enabling
// enumeration of mixins present at the time of testing.
Object.defineProperties(TestSuite.prototype, {
  addBuildResult: {
    value: function (filename) {
      this.build_results_.push(filename);

      var result_content = fs.readFileSync(filename, 'utf8');
      var mixin_keys = result_content.match(/^\.([\w-]+)/gm);
      mixin_keys = mixin_keys.map(function (key) {
        return key.substr(1);
      });

      this.build_result_contents_ += result_content + '\n';
      this.setMixinKeys(this.mixin_keys_.concat(mixin_keys));
    }
  },

  setMixinKeys: {
    value: function (mixin_keys) {
      this.mixin_keys_ = mixin_keys;
      this.updateSuite();
    }
  },

  updateSuite: {
    value: function () {
      this.setter_keys_.forEach(function (key) {
        delete this[key];
      }, this);

      this.mixin_keys_.forEach(function (key) {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: true,
          value: this.test.bind(this, key, null)
        });

        this[key].ms = this.test.bind(this, key, '-ms-');
      }, this);

      this.setter_keys_ = this.mixin_keys_.slice();
    }
  },

  test: {
    value: function (key, prefix, input, output, callback) {
      prefix = prefix || '';

      if (arguments.length === 3) {
        callback = arguments[2];
        output = arguments[1];
      }

      var fixture = 'div{.' + key + '(' + input + ');}';
      var parser = new RegExp('(\\{|;)\\s*' + prefix + key + ':\\s*([^;]+);');

      var less_code = this.build_result_contents_ + fixture;
      less.render(less_code, function (err, css) {
        if (err) {
          return callback(new Error(
            err.message + '\n\n' +
            err.extract.join('\n') + '\n'
          ));
        }

        var result = parser.exec(css);
        assert.equal(result[2], output);
        callback(null);
      });
    }
  }
});


module.exports = TestSuite;
