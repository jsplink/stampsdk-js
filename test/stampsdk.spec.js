/*global require, define, test, expect, strictEqual, location */
var
  util = require('lib/util'),
  _ = require('lib/underscore'),

  STAMP_FIXTURES = {
    'DEV-STAMP-B': {
      'serial': 'DEV-STAMP-B',
      'success': true,
      'points': [[6.7625, 5.7625], [43.5625, 56.1625], [41.4484024663, 25.5770262318],[5.57588538882, 22.164484302],[7.82982340358, 54.3234524584]],
    }, 
    'INVALID-A': {
      'serial': undefined,
      'success': false,
      'points': [[4, 50],[1, 36],[5, 55],[1, 12],[3, 24]]
    }
  },

  STAMPINGS = _.reduce(STAMP_FIXTURES, function(tests, stamp_raw, idx, fixtures) {
  }, []),

  CustomEvent = function(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
   };
  },

  triggerStamp = function() {

  };

CustomEvent.prototype = window.Event.prototype;

describe('stampsdk', function() {
  beforeEach(function(done) {
    var 
      sdk = StampSDK.init({
        version: 2,
        collectUsageData: true,
        appId: '1c311020a7375c375fb6',
        appSecret: '464bdd3a87b178f201d9215c1edf2532fe81b25a',
        successUrl: 'http://beta.snowshoestamp.com/api/v2/stamp',
        errorUrl: 'http://beta.snowshoestamp.com/api/v2/uasubmit',
        success: function(data) {
          expect(data.sessionId).toBeDefined();
          expect(data.stamp).toBeDefined();
          expect(data.stamp.serial).toBeDefined();
        },
        error: function(data) {
          expect(data.error).toBeDefined();
          expect(data.sessionId).toBeUndefined();
          expect(data.stamp).toBeUndefined();
        },
        spots: [{
          'spot': document.getElementsByTagName('body')[0]
        }]
      });

    // hit up the done
    done();
  });

  it('throws errors for incorrect sdk instantiation calls', function() {
    var 
      wrongVersionNoSuccessUrlError = new ValueError('Success handler is not supported in version 2, and version 3 is not yet released. Please define your server\'s endpoing via the successUrl parameter.'),
      wrongVersionSuccessError = new ValueError('Success handler is not supported in version 2, and version 3 is not yet released.'),
      wrongVersionNoErrorUrlError = new ValueError('Error handler is not supported in version 2, and version 3 is not yet released. Please define your server\'s endpoing via the errorUrl parameter.'),
      wrongVersionErrorError = new ValueError('Error handler is not supported in version 2, and version 3 is not yet released.'),
      unknownVersionError = new ValueError('Unrecognized version error. Valid options are "2" or "3".');
    expect(
      StampSDK.init({
        version: 2,
        collectUsageData: true,
        appId: 'testId',
        appSecret: 'testSecret',
        success: function(data) { return false; }
      })
    ).toThrow(wrongVersionNoSuccessUrlError);
    expect(
      StampSDK.init({
        version: 2,
        collectUsageData: true,
        appId: 'testId',
        appSecret: 'testSecret',
        success: function(data) { return false; },
        successUrl: 'http://example.com/stamped/success'
      })
    ).toThrow(wrongVersionSuccessError);
    expect(
      StampSDK.init({
        version: 2,
        collectUsageData: true,
        appId: 'testId',
        appSecret: 'testSecret',
        error: function(data) { return false; }
      })
    ).toThrow(wrongVersionNoErrorUrlError);
    expect(
      StampSDK.init({
        version: 2,
        collectUsageData: true,
        appId: 'testId',
        appSecret: 'testSecret',
        error: function(data) { return false; },
        errorUrl: 'http://example.com/stamped/error'
      })
    ).toThrow(wrongVersionErrorError);
  });

  it('creates a stampSpot over the body element by default', function() {

  });

  it('can handle a successful apiv2 call', function() {
    
  });

  it('can handle an erroneous apiv2 call', function() {

  });

  xit('can count different simultaneous event trigger events as a single event', function() {
    touchPoints.forEach(function(p, idx) {
      var e = new CustomEvent('pointerdown');
      e.clientX = p[0];
      e.clientY = p[1];
      e.pointerId = idx;
      touchEvents.push(e);
    });
    touchPoints.forEach(function(p, idx) {
      var e = new CustomEvent('pointerdown');
      e.clientX = p[0];
      e.clientY = p[1];
      e.pointerId = idx;
      touchEvents.push(e);
    });
  });

  xit('can handle a successful apiv3 call', function() {

  });

  xit('can handle an erroneous apiv3 call', function() {

  });

  xit('can query apiv2/stamp', function() {

  });

  console.debug('snowshoe stamp validation services');
});