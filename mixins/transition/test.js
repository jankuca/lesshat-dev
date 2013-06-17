var assert = require('assert');


describe('transition', function () {
  it('should return the same value', function (done) {
    test.transition('opacity 2s ease', 'opacity 2s ease', done);
  });

  it('should convert milliseconds to seconds', function (done) {
    test.transition('opacity 200ms ease', 'opacity .2s ease', done);
  });

  it('should prefix easing for IE', function (done) {
    test.transition.ms('opacity 2s ease', 'opacity 2s -ms-ease', done);
  });
});
