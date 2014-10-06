/*global require, define, test, expect, strictEqual, location */

define(['stampsdk', 'stampsdk.min'], function(StampSDK, StampSDKmin) {
  (function () {
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     };

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();

  describe('stampsdk-js', function() {
    stampsdk = StampSDK.init({
      CLIENT_ID = '1c311020a7375c375fb6',
      CLIENT_SECRET = '464bdd3a87b178f201d9215c1edf2532fe81b25a',
    });

    describe('snowshoe stamp validation services', function() {
      var 
        touchPoints = [
          [6.7625, 5.7625], 
          [43.5625, 56.1625], 
          [41.4484024663, 25.5770262318],
          [5.57588538882, 22.164484302],
          [7.82982340358, 54.3234524584]
        ]; 

      describe('when valid stamp is detected', function() {
        var
          successFn = jasmine.createSpy('success'),
          failFn = jasmine.createSpy('failure'),
          preFn = jasmine.createSpy('pre'),
          touchEvents,
          spotElem,
          spot;

        beforeEach(function(done) {
          touchEvents = [];
          spotElem = document.createElement('div');
          spot = stampsdk.makeSpot({
            'spot': spotElem,
            'success': function(data) {
              console.debug('success called!');
              successFn(data);
              done();
            },
            'failure': function(data) {
              console.debug('failure called!');
              failFn(data);
              done();
            },

            /**
            * @method pre
            * @param data - 2d array of point coordinates
            * @param next - Method for sending the data to the SnowShoeStamp Authentication endpoint
            */
            'pre': function(data, next) {
              console.debug('pre called!');
              preFn(data);
              return false;
              //next();
            }
          }, function() {
            touchPoints.forEach(function(p, idx) {
              var e = new CustomEvent('pointerdown');
              e.clientX = p[0];
              e.clientY = p[1];
              e.pointerId = idx;
              touchEvents.push(e);
            });
            
            setTimeout(function() {
              // quickly dispatch the pointerdown events
              touchEvents.forEach(function(e) {
                spotElem.dispatchEvent(e);
              });
            },0)
          });
        });

        it('should call the pre method', function() {
          expect(preFn).toHaveBeenCalledWith(touchPoints);
        });

        xit('should not fail when making a valid call', function() {
          expect(failFn).not.toHaveBeenCalled();
        });

        xit('should return the stamp serial', function() {
          expect(successFn).toHaveBeenCalledWith({
            stampId: 1
          });
        });
      })

      xit('calls the failure method after an invalid stamp response', function() {

      });
    });
  });
});