# StampSDK-js

StampSDK-js is the SnowShoeStamp JavaScript API for stamping. 

## Freenode Developer Community

If you have any questions for the SnowShoe technical team (or if you'd just like to show some love), please visit us in the Freenode IRC channel #snowshoestamp

## Github Issues

There is no dumb question. Feel free to post issues so we can hammer 'em out together!

## Goals for RC1

The overarching goal of this project is to provide a minimal interface for developers to easily integrate with their SnowShoeStamps.

### oAuth2.0 support & eventual oAuth1.0a deprecation

The current system uses oAuth1.0a. Another goal of this project is to migrate away from oAuth1.0a and toward both two-legged and three-legged oAuth2.0 implementations. This will mean the exchanging of codes and access\_tokens and refresh_tokens and shall move us away from the sharing of permanent serial numbers which will in turn increase the security of this platform.

### Even better stamping goodness

We are working on several back-end projects to increase the reliability and speed and support for stamping goodness. StampSDK will support all of these projects as time progresses.

## API

Much of the API is built to bypass the need for the developer to setup his or her own server. We believe that this will make our platform more accessible and would help increase the end user experience via faster stamping.

```xhtml
<!-- Some non-standard html setup as an example... -->
<html><head></head>
<body>
   <div id="stamp-pad"></div>
</body></html>
<script>
```
```js
var 
  stampsdk = StampSDK.init({
    APP_ID: <Application ID>,  // Not yet supported on the front-end!
    APP_KEY: <Application Key> // Not yet supported on the front-end!
  });
  
stampsdk.makeSpot({
  spot: document.getElementById('stamp-pad'), // or i.e. document.getElementsByTagName('body')[0] 
  success: function(args) {
    // Not yet supported on the front-end! Awaiting oAuth2.0 support.
  }, failure: function(args) {
    // Not yet supported on the front-end! Awaiting oAuth2.0 support.
  }, pre: function(points) {
    // Supported! This is where you can pass the points to your back-end api to query our servers for the stamp details.
    return false; // just remember to return false here so that the unsupported oAuth2.0 process won't take place!
  })
});
```

## License 

```
Copyright 2014 SnowShoe Food, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
