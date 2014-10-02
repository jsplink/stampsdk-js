define(function() {
// private property
  var base64 = {};
  base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  function browserSupportsCSSProperty(propertyName) {
    var elm = document.createElement('div');
    propertyName = propertyName.toLowerCase();

    if (elm.style[propertyName] != undefined)
      return true;

    var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1),
      domPrefixes = 'Webkit Moz ms O'.split(' ');

    for (var i = 0; i < domPrefixes.length; i++) {
      if (elm.style[domPrefixes[i] + propertyNameCapital] != undefined)
        return true;
    }

    return false;
  }

  // private method for UTF-8 encoding
  base64._utf8_encode = function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
              utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }
      }
      return utftext;
  };

  // private method for UTF-8 decoding
  base64._utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    
    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  };

  // public method for encoding
  base64.encode = function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = base64._utf8_encode(input);
      while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }
          output = output +
              this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
              this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
  };
  
  // public method for decoding
  base64.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = base64._utf8_decode(output);
    return output;
  };

  /**
  * simple class inheritance
  * @param {Function} child
  * @param {Function} base
  * @param {Object} [properties]
  */
  function inherit(child, base, properties) {
    var baseP = base.prototype,
    childP;
    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;
    if (properties) {
      extend(childP, properties);
    }
  }

  /**
  * extend object.
  * means that properties in dest will be overwritten by the ones in src.
  * @param {Object} dest
  * @param {Object} src
  * @param {Boolean} [merge]
  * @returns {Object} dest
  */
  function extend(dest, src, merge) {
    var keys = Object.keys(src);
    for (var i = 0, len = keys.length; i < len; i++) {
      if (!merge || (merge && dest[keys[i]] === undefined)) {
        dest[keys[i]] = src[keys[i]];
      }
    }
    return dest;
  }

  /**
  * merge the values from src in the dest.
  * means that properties that exist in dest will not be overwritten by src
  * @param {Object} dest
  * @param {Object} src
  * @returns {Object} dest
  */
  function merge(dest, src) {
    return extend(dest, src, true);
  }

  function prettyPrint(obj){
    var toString = Object.prototype.toString,
        newLine = "<br>", space = "&nbsp;", tab = 8,
        buffer = "",
        //Second argument is indent
        indent = arguments[1] || 0,
        //For better performance, Cache indentStr for a given indent.
        indentStr = (function(n){
          var str = "";
          while(n--){
            str += space;
          }
          return str;
        })(indent);

    if(!obj || ( typeof obj != "object" && typeof obj!= "function" )){
      //any non-object ( Boolean, String, Number), null, undefined, NaN
      buffer += obj;
    }else if(toString.call(obj) == "[object Date]"){
      buffer += "[Date] " + obj;
    }else if(toString.call(obj) == "[object RegExp"){
      buffer += "[RegExp] " + obj;
    }else if(toString.call(obj) == "[object Function]"){
      buffer += "[Function] " + obj;
    }else if(toString.call(obj) == "[object Array]"){
      var idx = 0, len = obj.length;
      buffer += "["+newLine;
      while(idx < len){
        buffer += [
          indentStr, idx, ": ",
          prettyPrint(obj[idx], indent + tab)
        ].join("");
        buffer += "<br>";
        idx++;
      }
      buffer += indentStr + "]";
    }else { //Handle Object
      var prop;
      buffer += "{"+newLine;
      for(prop in obj){
        buffer += [
          indentStr, prop, ": ",
          prettyPrint(obj[prop], indent + tab)
        ].join("");
        buffer += newLine;
      }
      buffer += indentStr + "}";
    }

    return buffer;
  }

  (function() {
    var method;
    var noop = function noop() {};
    var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
      method = methods[length];

      // Only stub undefined methods.
      if (!console[method]) {
        console[method] = noop;
      }
    }
  }());

  
  return {
    base64: base64,
    uuid: function() { 
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
    getQueryParams: function() {
      var params = window.location.href.split("?")[1];
      if(params === undefined ) return {};
      params = params.split("&");
      params_map = {};
      for(var i = 0; i < params.length; i++){
        var param = params[i].split("=");
        params_map[param[0]] = param[1];
      }
      return params_map;
    },
    inherit: inherit,
    extend:extend,
    merge:merge,
    pprint: prettyPrint
  }
});
