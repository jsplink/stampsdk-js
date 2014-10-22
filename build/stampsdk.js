/* jshint undef:true, unused:true, strict:true, maxparams:3, maxdepth:3, browser:true */

/** 
* @module StampSDK-js
* @author John Sphar <jlsphar@snowshoestamp.com>
* @requires util - Utility module w/ subclassing sugar and uuid/base64 generation.
* @requires handjs-1.8.3 - Microsoft's HandJS touch polyfill.
* @requires json3 - The JSON polyfill.
* @TODO delete any utility methods not being used
* @TODO add support for oAuth2.0 and option to switch between oAuth1.0a and oAuth2.0
*/
define([
  'lib/util',
  'lib/oauth',
  'lib/handjs-1.8.3'
], function(util) { 'use strict';
  var
    /** 
    * @TODO integrate keen for usage data sharing
    * @TODO add option for user to disable usage data sharing
    */ 
    keen, // disabling keen here 

    /**
    * Version 2 uses the consumer's endpoint as a relay to the SnowShoeStamp API.
    * Version 3 uses a CORS-enabled SnowShoeStamp API to validate.
    * @constant USING_VERSION
    */
    USING_VERSION = 2,

    /**
    * Endpoint for the SnowShoeStamp API
    * @constant DOMAIN - Base URL for the snowshoestamp endpoing.
    * @constant SSSAPIQ - The SnowShoeStamp endpoint.
    */
    DOMAIN = 'http://dev2.snowshoestamp.com/',
    SSSAPIQ = DOMAIN + 'api/v2/stamp',

    /**
    * How many miliseconds between points. Modify as necessary, maybe even a different value per device.
    * @constant {number} STAMP_THRESHHOLD
    */
    STAMP_THRESHHOLD = 500,

    /**
    * How much time needs to be in between different stamps for them to be recognized?
    * @constant {number} MIN_TIME_BETWEEN_STAMPS
    */
    MIN_TIME_BETWEEN_STAMPS = 500,

    /**
    * How many points per stamp?
    * @constant {number} MIN_POINTS_PER_STAMP
    */
    MIN_POINTS_PER_STAMP = 5,

    /**
    * The ID for the consumer client.
    * @prop {string} appId
    * @TODO implement appId
    */
    appId,

    /**
    * The secret for Mobile-side authentication.
    * @prop {string} appSecret
    * @TODO implement appSecret
    */
    appSecret,

    errorUrl,
    successUrl,

    /**
    * Represents the area for a points stamp.
    * @class Stamp
    * @param {string} [options.accessToken]
    * @param {string|number} [options.stampSerial]
    */
    Stamp = function(options) {
      var _this = this;

      _this.options = util.merge(options || {}, _this.defaults);

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
    * @param {object} [options.spot] - The element to bind to
    */
    StampSpot = function(options, fn) {
      var _this = this;
      _this.options = util.merge(options || {}, _this.defaults);

      /**
      * The stamps which have been detected on this spot.
      * @prop {Array} stamps
      */
      _this.stamps = [];

      /**
      * The user-defined success method.
      * @method {function} success
      */
      _this.success = _this.options.success;

      /**
      * The user defined error method
      * @method {function} error
      */
      _this.error = _this.options.error;

      /**
      * Pre-validation method.
      * @method {function} pre
      * @param {array} points - The coordinates for the SSS endpoint request.
      */
      _this.pre = options.pre;

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
        if (keen !== undefined) {
          keen.track('stampscreen', {
            'type': 'successful stamp',
            'details': args
          });  
        }
        
        _this.success(args);
      };

      /**
      * @method onerror
      * @param args
      * @param {string} args.receipt - Base64 Digest of the Receipt
      * @param {string} args.created - ISO8601 datetime string
      * @param {boolean} args.secure - Whether or not this session was secure
      * @param {object} args.error - The error data
      * @param {string} args.error.message - The reason for the error. Either 'Stamp not found', 'Argument parse error', 
      * @param {number} args.error.code - The code number for the particular error. Either 32, 30, or 31, respectively.
      * @param {number} args.error.http_status - Always will be 400 upon error or 'Wrong number of points'.
      */
      _this.onerror = function(args) {
        if (keen !== undefined) {
          keen.track('stampscreen', {
            'type': 'failed stamp',
            'details': args
          });  
        }
        
        _this.error(args);
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
      * @TODO look up and check the response.stampSerial (what's actually sent through?)
      */
      _this._validate = function(_points) {
        var 
          req = USING_VERSION === 2 ? util.createRequest('POST', successUrl) : util.createCORSRequest('POST', SSSAPIQ),
          reqData = new FormData();

        if (USING_VERSION === 2) {
          reqData.append('consumerKey', appId);
          reqData.append('consumerSecret', appSecret);
          reqData.append('')
        } else if (USING_VERSION === 3) {
          var 
            oauthClient = new OAuth({
              'consumer': {
                'secret': appSecret,
                'public': appId
              }
            }),
            oauthData,
            authDict,
    
            /**
            * Load event for the XHR request.
            * @event load
            */
            reqOnLoad = function() {
              try {
                var 
                  resp = JSON.parse(req.response),
                  stamp = resp.stamp,
                  stampSerial = stamp !== undefined ? stamp.serial : undefined,
                  hasBeenStamped = false;

                if (stampSerial === undefined) {
                  console.error(err.message);
                  _this.onerror(resp);
                  return;
                }

                match = _this.stamps.filter(function(s) {
                  return s.stampSerial === stampSerial;
                });

                if (match && match.length === 1) {
                  match[0].pressed();
                  hasBeenStamped = true;
                } else {
                  _this.stamps.push(new Stamp({
                    'stampSerial': (stampSerial !== undefined ? stampSerial : undefined)
                  }));
                }

                _this._lastStamped = now;

                _this.onSuccess(resp);
              } catch (err) {
                _this.onerror(resp);
                return;
              }
            },

            reqOnError = function(e) {
              var
                resp = req.response;
              console.warn(e);
              _this.onerror(resp);
            };

          _this.pre(_points, function() {
            if (req === null) {
              throw new Error("CORSNotSupported");
            } else {
              req.withCredentials = true;
              req.onerror = reqOnError;
              req.onload = reqOnLoad;

              oauthData = oauthClient.authorize({
                  url: SSSAPIQ,
                  method: 'POST',
                  data: reqData
              });

              authDict = oauthClient.toHeader(oauthData);

              // setup oAuth1.0a
              req.setRequestHeader('Authorization', authDict.Authorization);
              req.send(oauthData);

              // 2. Setup the oAuth string
              reqData.append('data', util.base64.encode(JSON.stringify(_points)));
            }

          });
        }
      };

      /**
      * Triggers during the pointdown event on the element.
      * @method _pointdown
      */
      _this._pointdown = function(evt) {
        var 
          now = (new Date()).getTime(),
          fromBegun = now - _this._pressBegun,
          sinceLastStamp = now - _this._lastStamped,
          validStampTime = (_this._lastStamped === undefined || sinceLastStamp > MIN_TIME_BETWEEN_STAMPS),
          validPressTime = fromBegun < STAMP_THRESHHOLD,
          coords;

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

      _this.options.spot.addEventListener('pointerup', _this._pointup, true);
      _this.options.spot.addEventListener('pointerdown', _this._pointdown, true);
      _this.options.spot.addEventListener('pointermove', _this._pointmove, true);

      if (fn !== undefined && Function.isFunction(fn)) {
        fn();  
      }
    }, // end of StampSpot class

    /**
    * Initializes SnowDK with the appId and their redirectUri
    * @method init
    * @param {object} args - Arguments for the sdk's initiation
    * @param {string} args.appId - The consumer's client id
    * @param {string} args.
    * @param {string} [args.appSecret] - The consumer's client secret. Not actually a secret since it's on the client but enables native apps to not have a consumer server. Also present in oAuth standards.
    */
    init = function(args) {
      args = !!args ? args : {};

      /**
      * @prop {string} appId     - The appId for the consumer
      */
      appId = !!args.appId ? args.appId : undefined;

      /**
      * @prop {string} appSecret - The secret of the client. Obviously not secure but allows native-only apps to work on our API.
      */
      appSecret = !!args.appSecret ? args.appSecret : undefined;

      /**
      * @prop {string} successUrl - Deprecated. The URL to pass the coordinates to, to forward to SnowShoeStamp validation endpoint.
      */
      successUrl = !!args.successUrl ? args.successUrl : 'http://beta.snowshoestamp.com/api/v2/stamp';

      /**
      * @prop {string} errorUrl - Deprecated. The URL to pass the user to when a stamping fails.d
      */
      errorUrl = !!args.errorUrl ? args.errorUrl : 'http://beta.snowshoestamp.com/api/v2/uasubmit';

      if (args.collectUsageData === false) {
        keen = undefined;
      }

      // set the oAuth version
      if (args.version !== undefined || args.version === 2) {
        USING_VERSION = 2;
      } else if (args.version === 3) {
        USING_VERION = 3;
      } else {
        throw new ValueError('Unrecognized version error. Valid options are "2" or "3".');
      }

      return {
        makeSpot: makeSpot
      };
    },

    /**
    * Creates a stamp spot.
    * @param {object} args - The object for this document
    * @param {DOMElement} args.spot - The element to listen to for the stamp presses.
    * @param {method} args.success - The callback for a successful validation.
    * @param {method} args.successUrl - The URL to go to with the stamp coordinates. Deprecated.
    * @param {method} args.error - The callback for a successful validation.
    * @param {method} args.errorUrl - The callback for an erroneous stamp. Deprecated.
    * @param {method} args.stamp - Called before sending the stamp off to the SSS api. Return false to halt the process.
    */
    makeSpot = function(args, fn) {
      if (args.spot === undefined) {
        throw new Error('No spot element was passed in.');
      } else if (args.success === undefined) {
        throw new Error('No success handler was passed in.');
      } else if (args.error === undefined) {
        throw new Error('No error handler was passed in.');
      }

      var 
        spot = new StampSpot(args, fn);

      // shoot off event to keen
      if (keen !== undefined) {
        keen.track('spot', {'type': 'init'});
      }

      return spot;
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
    status: ''
  }; // end of StampType prototype

  /**
  * @memberof StampSpot
  * @namespace defaults
  * @prop {element} defaults.elem  - Default element is the 'body'.
  */
  util.inherit(StampSpot, StampType, {
    defaults: {
      'spot': document.getElementsByTagName('body')[0]
    }
  });

  /**
  * @namespace
  * @memberof Stamp
  */
  util.inherit(Stamp, StampType, {
    defaults: {}
  });

  return {
    init: init
  };
});