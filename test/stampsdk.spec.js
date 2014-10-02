describe('JavaScript SDK for SnowShoe Stamps', function() {
  var 
    requirejs = require('requirejs'),
    TESTBED_URL = 'http://localhost:8000',
    page = require('webpage');

  // programmatically set requirejs configuration for tests
  requirejs(['phantomjs', ], function(pjs) {
    beforeEach(function() {
      // setup the browser
    });

    afterEach(function() {
      // reset stamp calls
    });

    it('shall detect when a stamp is pressed', function() {
      requirejs(['stampsdk'], function(stampsdk) {
        var 
          wp = page.create(),
          canvas,
          test_points = [[6.7625, 5.7625], [43.5625, 56.1625], [41.4484024663,25.5770262318],[5.57588538882,22.164484302],[7.82982340358,54.3234524584]];

        wp.evaluate(function() {
          canvas = document.createElement('canvas');
          spot = stampsdk.makeSpot(canvas);

          spot.spotOn('validating', function(points) {
            points.should.equal(test_points);
          });
          spot.spotOn('valid', function(data) {
            data.should.equal({
              'getStampId': getStampId,
              'setStampId': setStampId,
              'getAccessToken': getAccessToken,
              'setAccessToken': setAccessToken
            });
            data.should.eql
          });
          spot.spotOn('invalid', function(data) {

          });
        });

        var tbPage = page.open('http://dev2.snowshoestamp.com/testbed', function(status) {

        });

        stampsdk.spotOn(canvas)
      });
    });

    it('shall query the api endpoint when the stamp is pressed', function() {

    });

    it('shall throw the validating event when a stamp is pressed', function() {

    });

    it('shall throw the valid event when the stamp is deemed valid', function() {

    });

    it('shall throw the invalid event when the stamp is deemed invalid', function() {

    });
  });
});