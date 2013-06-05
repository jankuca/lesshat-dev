var assert = require('assert');


describe('transition', function () {
  it('should return the same value', function () {
    var res = mixins.transition('opacity 2s ease');
    assert(res, 'opacity 2s ease');
  });

  it('should return MS/ for MS', function () {
    var res = mixins.transition.ms('opacity 2s ease');
    assert(res, 'MS/opacity 2s ease');
  });

  it('should not support gecko', function () {
    assert(mixins.transition.moz, false);
  });
});
