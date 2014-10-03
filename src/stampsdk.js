/** 
* @module StampSDK-js
* @author John Sphar <jlsphar@snowshoestamp.com>
* @requires util - Utility module w/ subclassing sugar and uuid/base64 generation.
* @requires handjs-1.8.3 - Microsoft's touch polyfill.
* @requires json3 - The JSON polyfill.
* @TODO clear debug logging
* @TODO re-enable keen
* @TODO add a @license
* @TODO add to an Angular controller & create an adapter module (Q)
*/
define(['lib/util', 'lib/spin', 'lib/jquery.min', 'lib/oauth', 'lib/handjs-1.8.3', 'lib/json3'], 
function(util, Spinner, $) { 'use strict';
  var
    /** 
    * @TODO make optional by including keen above & integrating 
    */
    keen = undefined,

    /**
    * Version for the oAuth endpoint
    * @constant OAUTH_VERSION
    * @TODO finish & test implementation
    */
    OAUTH_VERSION = 2,

    /**
    * Endpoint for the SnowShoeStamp API
    * @constant DOMAIN - Base URL for the snowshoestamp endpoing.
    * @constant SSSAPIQ - The SnowShoeStamp endpoint.
    */
    DOMAIN = 'http://beta.snowshoestamp.com/',
    SSSAPIQ = DOMAIN + 'api/v2/stamp',

    /**
    * How many miliseconds between points. Modify as necessary, maybe even a different value per device.
    * @constant {number} STAMP_THRESHHOLD
    * @TODO Change between devices?
    */
    STAMP_THRESHHOLD = 500,

    /**
    * How much time needs to be in between different stamps for them to be recognized?
    * @constant {number} MIN_TIME_BETWEEN_STAMPS
    * @TODO Change between devices?
    */
    MIN_TIME_BETWEEN_STAMPS = 500,

    /**
    * How many points per stamp?
    * @constant {number} MIN_POINTS_PER_STAMP
    */
    MIN_POINTS_PER_STAMP = 5,

    /**
    * The ID for the consumer client.
    * @prop {string} clientId
    * @TODO implement clientId
    */
    clientId,

    /**
    * The secret for Mobile-side authentication.
    * @prop {string} clientSecret
    * @TODO implement clientSecret
    */
    clientSecret,

    /**
    * The stamp spots for a stamp.
    * @prop stampSpots
    */
    stampSpots = {},

    /**
    * Represents the area for a points stamp.
    * @class Stamp
    * @param {string} [options.accessToken]
    * @param {string|number} [options.spotId]
    * @param {string|number} [options.stampSerial]
    */
    Stamp = function(options) {
      var _this = this;

      _this.options = util.merge(options || {}, _this.defaults);

      /** 
      * The spotId this stamp was recognized on.
      * @prop {string} spotId
      */
      _this.spotId = _this.options.spotId;

      /** 
      * The globally-unique identifier for this stamp.
      * @prop {string} stampSerial
      */
      _this.stampSerial = _this.options.stampSerial;

      /**
      * Set the stampSerial for this stamp.
      * @method setStampSerial
      * @param {string} stampSerial - The stampSerial for this stamp. 
      */
      _this.setStampSerial = function(stampSerial) {
        _this.stampSerial = stampSerial;
      };
    }, // end Stamp class

    /**
    * Spots on the user interface where stamps are planning on being registered.
    * @class StampSpot
    * @param {object} [options.spinnerParams] - The configuration for the spinner.
    * @param {object} [options.spot] - The element to bind to
    * @param {string | number} [options.spotId] - The identifier for this spot
    */
    StampSpot = function(options) {
      var _this = this;
      _this.options = util.merge(options || {}, _this.defaults);

      /**
      * The stamps which have been detected on this spot.
      * @prop {Array} stamps
      */
      _this.stamps = [];

      /**
      * The spinner instance for this StampSpot.
      * @prop {object} spinner
      */
      _this.spinner = new Spinner(_this.options.spinnerParams);

      /**
      * The unique ID for the stampSpot.
      * @prop {string} spotId
      */
      _this.spotId = _this.options.spotId;

      /**
      * The user-defined success method.
      * @method {function} success
      */
      _this.success = options.success;

      /**
      * The user defined failure method
      * @method {function} failure
      */
      _this.failure = options.failure;

      /**
      * The time the stamping begun.
      * @prop {epoch} _pressBegun
      */
      _this._pressBegun = (new Date()).getTime();

      /**
      * Collection of point events
      * @namespace
      * @prop {array} _points.0
      * @prop {array} _points.1
      * @prop {array} _points.2
      * @prop {array} _points.3
      * @prop {array} _points.4
      */
      _this._points = {};

      /**
      * When the last stamp was detected.
      * @prop {epoch | undefined} _lastStamped
      */
      _this._lastStamped = undefined;

      /**
      * This event fires when a StampType on the Spot has been verified via the SSS API.
      * @method success
      * @param {object} args - The response from the server.
      * @param {string} args.receipt - The uuid base64 digest for this api call.
      * @param {string} args.created - The ISO8601 timedate string for this api call.
      * @param {securet} args.secure - Whether or not this app is secure.
      * @param {string} args.stamp.serial - The serial for this stamp.
      * @example args (success)
      *   {
      *     'receipt': <base64 digest>,
      *     'created': <ISO8601 time string>,
      *     'secure': <(true | false)>
      *     'stamp': { 'serial': <serial_string> }
      *   }
      */
      _this.onSuccess = function(args) {
        this.success(args);
      };

      /**
      * @method onFailure
      * @param args
      * @param {string} args.receipt - Base64 Digest of the Receipt
      * @param {string} args.created - ISO8601 datetime string
      * @param {boolean} args.secure - Whether or not this session was secure
      * @param {object} args.error - The error data
      * @param {string} args.error.message - The reason for the error. Either 'Stamp not found', 'Argument parse error', 
      * @param {number} args.error.code - The code number for the particular error. Either 32, 30, or 31, respectively.
      * @param {number} args.error.http_status - Always will be 400 upon error or 'Wrong number of points'.
      */
      _this.onFailure = function(args) {
        this.failure(args);
      };

      /**
      * Reset the point information.
      * @method _resetPoints
      */
      _this._resetPoints = function() {
        _this._points = {};
      };

      /**
      * Get point coordinates.
      * @method _getPointCoords
      */
      _this._getPointCoords = function() {
        var out = [];
        // check to see how we should format this coordinate system
        for (var k in _this._points) {
          out.push([_this._points[k].clientX,_this._points[k].clientY]);
        }
        return out;
      };

      /**
      * Send the coordinates to be validated against the URL.
      * @param {array} points - The coordinates of the stamp.
      * @returns {object | boolean} interface - If validation was successful, return the interface to the Stamp.
      * @TODO Trigger the correct handlers ^_^
      * @TODO look up and check the response.stampSerial (what's actually sent through?)
      */
      _this._validate = function(_points) {
        var 
          req = new XMLHttpRequest(),
          reqData = new FormData(),
          oauthClient = new OAuth({
            'consumer': {
              'secret': clientSecret,
              'public': clientId
            }
          }),
          oauthData,
          authDict;

        // 1. Start spinning the spinner
        _this.spinner.spin(_this.options.elem);

        // 2. Setup the oAuth string
        reqData.append('data', util.base64.encode(JSON.stringify(_points)));
        oauthData = oauthClient.authorize({
            url: SSSAPIQ,
            method: 'POST',
            data: reqData
        });

        authDict = oauthClient.toHeader(oauthData);

        // 3. Trigger the pre-validation handlers
        try {
          if (_this._pre !== undefined) {
            _this._pre(_points);  
          }
        } catch(err) {
          _this.spinner.stop();
          return;
        }

        /**
        * Load event for the XHR request.
        * @event load
        * @TODO parse both queries differently
        */
        req.addEventListener('load', function(e) {
          var 
            resp = req.response,
            hasBeenStamped = false;

          try {
            theStamp = new Stamp({
              'spotId': _this.spotId,
              'stampSerial': resp.stampSerial !== undefined ? resp.stampSerial : undefined
            });
          } catch(err) {
            _this.spinner.stop();
            // assume there was a stamp error
            _this.failure(resp);
            return;
          }

          // look for that stamp already
          _this.stamps.forEach(function(stamp) {
            if (stamp.stampSerial === theStamp.stampSerial) {
              if (!!stamp.stampSerial && !!theStamp.stampSerial)
                stamp.stampSerial = theStamp.stampSerial;
              if (!!stamp.accessToken && !!theStamp.accessToken)
                stamp.accesstoken = theStamp.accessToken;
              stamp.pressed();
              hasBeenStamped = true;
            }
          });

          // add the stamp to this spot and update the spot
          if (!hasBeenStamped)
            _this.stamps.push(theStamp);

          _this._lastStamped = now;
          _this.spinner.stop();

          // trigger event handlers for the 'validated'
          // return the stamp's interface to any registered callbacks
          _this.onSuccess(resp);//theStamp.getInterface());
        
        }, false); // END addEventListener('list', ...)>

        /** @TODO support onError */
        req.addEventListener('error', function(e) {
          var
            resp = req.response;
          _this.spinner.stop();
          _this.onFailure(resp);
        }, false);

        req.open('GET', SSSAPIQ);
        req.setRequestHeader(
          'Authorization', 
          authDict['Authorization']
        );
        req.send(oauthData);
      };

      /**
      * Triggers during the pointdown event on the element.
      * @method _pointdown
      * @TODO Refactor here to grab stampSerial from SSSAPI before creating stamp.
      * @TODO Account for partial stamp point recognition movement by updating the [X,Y] until all five points have been hit or one is lifted.
      */
      _this._pointdown = function(evt) {
        var 
          now = (new Date()).getTime(),
          points = [evt.clientX, evt.clientY],
          fromBegun = now - _this._pressBegun,
          sinceLastStamp = now - _this._lastStamped,
          validStampTime = (_this._lastStamped === undefined || sinceLastStamp > MIN_TIME_BETWEEN_STAMPS),
          validPressTime = fromBegun < STAMP_THRESHHOLD,
          coords,
          theStamp,
          req,
          data;

        evt.preventDefault();

        if (!validPressTime) {
          _this._resetPoints();
          _this._pressBegun = (new Date()).getTime();
        }

        // get coordinates without this guy w/o the new pointset (no race condition)
        coords = _this._getPointCoords();

        if (_this._points[evt.pointerId] === undefined && validStampTime) {
          // add this new point to the set before grabbing the coordinates
          coords.push([evt.clientX, evt.clientY]);

          // define this event in the _points
          _this._points[evt.pointerId] = util.extend({},evt,true);
          
          // is quite possibly a complete stamp
          if (coords.length === MIN_POINTS_PER_STAMP) {
            // call keen if it's there
            if (keen !== undefined) {
              keen.track('stampscreen', {
                'type': 'points captured'
              });
            }
            // validate the stamp
            _this._validate(coords);
            // reset the points
            _this._resetPoints();
          }
        }
      }; // end of _this._pointdown(evt) { ... }

      /**
      * @method _pointup
      * @param {event} evt - The event for the stamp.
      */
      _this._pointup = function(evt) {
        if (_this._points[evt.pointerId]) {
          delete _this._points[evt.pointerId];
        }
      };

      /**
      * @method _pointmove
      * @param {event} evt - The event for the point movement.
      */
      _this._pointmove = function(evt) {
        if (_this._points[evt.pointerId]) {
          _this._points[evt.pointerId].clientX = evt.clientX;
          _this._points[evt.pointerId].clientY = evt.clientY;
        }
      };

      /**
      * @method getInterface
      */
      _this.getInterface = function() {
        return {
          /**
          * Bind a method to a spot event.
          * @method spotOn
          * @param {string} eventName - The eventName to bind to.
          * @param {function} cb - The method to fire when the event fires.
          */
          spotOn: function(eventName, cb) {
            if (!!_this._eventHandlers[eventName]) {
              _this.on(eventName, cb);  
            }
            return _this.getInterface();
          }
        };
      };

      _this.options.elem.addEventListener('pointerup', _this._pointup, false);
      _this.options.elem.addEventListener('pointerdown', _this._pointdown, false);
      _this.options.elem.addEventListener('pointermove', _this._pointmove, false);
    }, // end of StampSpot class

    /**
    * Returns the interface into the SDK.
    * @method getInterface
    * @returns {object} The SDK Interface
    */
    getInterface = function() {
      return {
        'init': init,
        'makeSpot': makeSpot
      };
    },

    /**
    * Initializes SnowDK with the clientId and their redirectUri
    * @method init
    * @param {string} args.clientId     - The consumer's client id
    * @param {string} args.clientSecret - (opt.) The consumer's client secret. Not secure but enables native apps to not have a consumer server. Also present in the oAuth2.0 standard.
    * @param {string} args.redirectUri  - Future version of the initiation of this sdk.
    * @TODO implement the clientId
    */
    init = function(args) {
      args = !!args ? args : {};

      /**
      * @prop {string} clientId     - The clientId for the consumer
      */
      clientId = !!args.clientId ? args.clientId : undefined;

      /**
      * @prop {string} clientSecret - The secret of the client. Obviously not secure but allows native-only apps to work on our API.
      */
      clientSecret = !!args.clientSecret ? args.clientSecret : undefined;

      /**
      * @prop {string} redirectUri  - The redirect uri for the client.
      * @TODO implement the redirectUri
      */
      redirectUri = !!args.redirectUri ? args.redirectUri : undefined;

      if (args.collectUsageData === false) {
        keen = undefined;
      }

      /** 
      * Detect if this is oAuth1.0 or oAuth2.0 via arg parameters
      * @TODO Gracefully deprecate oAuth1.0 and add oAuth2.0
      * @TODO Deprecate the success and error urls 
      */
      if (args.redirectUri !== undefined) SSSAPIQ = args.redirectUri;
      if (args.oauth !== undefined) OAUTH_VERSION = 1;

      return getInterface();
    },

    /**
    * Creates a stamp spot and returns the ID for the stamp spot then used to bind to spot events using SpotOn.
    * @param {object} args - The object for this document
    * @param {DOMElement} args.spot - The element to listen to for the stamp presses.
    * @param {method} args.success - The callback for a successful validation.
    * @param {method} args.failure - The callback for a successful validation.
    */
    makeSpot = function(args) {
      if (args.spot === undefined) {
        throw new Error('No spot element was passed in.');
      } else if (args.success === undefined) {
        throw new Error('No success handler was passed in.');
      } else if (args.failure === undefined) {
        throw new Error('No failure handler was passed in.');
      }

      var 
        spot = new StampSpot({
          'spot': args.spot,
          'success': args.success,
          'failure': args.failure
        }),
        spotId = spot.spotId;

      // shoot off event to keen
      if (keen !== undefined) {
        keen.track('spot', {'type': 'init'});
      }

      // add in pre-validation handling for backend apps
      if (args._pre !== undefined) {
        spot._pre = args._pre;
      }

      stampSpots[spot.spotId] = spot;
      return spot.getInterface();
    },

    /**
    * Common properties and methods across Stamp and StampSpot. 
    * @class StampType
    */
    StampType = function(){};

  StampType.prototype = {
    /**
    * @prop {string} status
    */
    status: '', 
  }; // end of StampType prototype

  /**
  * @memberof StampSpot
  * @namespace defaults
  * @prop {element} defaults.elem  - Default element is the 'body'.
  * @prop {string}  defaults.spotId        - Default spotId is a generated UUID.
  * @prop {string}  defaults.spinnerType   - Default spinnerType is 'pulse'.
  */
  util.inherit(StampSpot, StampType, {
    defaults: {
      'elem': document.getElementsByTagName('body')[0],
      'spotId': util.uuid(),
      'spinnerParams': {
        lines: 17, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 15, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1.5, // Rounds per second
        trail: 64, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
      }
    }
  });

  /**
  * @namespace
  * @memberof Stamp
  * @prop {string} defaults.spotId - Default spotId is a generated UUID.
  */
  util.inherit(Stamp, StampType, {
    defaults: {
      'spotId': util.uuid()
    }
  });

  return getInterface();
});