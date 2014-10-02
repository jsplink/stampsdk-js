// Karma configuration
// Generated on Sun Aug 31 2014 07:34:39 GMT-0700 (PDT)

module.exports = function(config) {
  // list of files / patterns to load in the browser
  files = [
    JASMINE,
    JASMINE_ADAPTER,
    REQUIRE,
    REQUIRE_ADAPTER,

    {pattern: 'lib/*.js', included: false},
    {pattern: '*.js', included: false},
    {pattern: '../test/**/*Spec.js', included: false},

    'test/test-main.js'
  ];


  // list of files to exclude
  exclude = [
    
  ];

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './build/js',


    plugins: [
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-script-launcher',
    'karma-jasmine'
    ],


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser



    // list of files to exclude



    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8090,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'Safari', 'Opera', 'PhantomJS', 'IE', 'ChromeCanary'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
