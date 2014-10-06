
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    verbose: true,
    root: {
      app: 'src',
      test: 'test',
      build: 'build',
      dist: 'dist'
    },
    requirejs: {
      compile: {
        options: {
          "appDir": "",
          "dir": "build",
          "baseUrl": "src",
          "shim": {
            "lib/keen.min": {
              "exports": "Keen"
            }
          },
          "skipDirOptimize": true,
          "fileExclusionRegExp": /^_/,
          "enforceDefine": false,
          "keepBuildDir": false,
          "locale": "en-us",
          "optimize": "uglify2",
          "generateSourceMaps": true,
          "uglify2": {
            "output": {
              "beautify": false
            },
            "compress": {
              "sequences": true,
              "dead_code": true,
              "drop_debugger": true,
              "unused": true,
              "side_effects": false,
            },
            "warnings": true,
            "mangle": true
          },
          "inlineText": true,
          "useStrict": true,
          "skipModuleInsertion": false,
          "wrap": {
            "startFile": "wrap/wrap.start",
            "endFile": "wrap/wrap.end"
          },
          "findNestedDependencies": true,
          "removeCombined": false,
          "modules": [
            {"name": "stampsdk"}
          ],
          "preserveLicenseComments": false,
          "logLevel": 4,
          "throwWhen": {
            "optimize": true
          },
          "waitSeconds": 7,
          almond: true,
          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);
            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }
            done();
          }
        }
      }
    },
    jshint: {
      options: {
        "curly": true,    // true: Require {} for every new block or scope
        "eqeqeq": true,   // true: Require triple equals (===) for comparison
        "immed": true,    // true: Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
        "newcap": true,   // true: Require capitalization of all constructor functions e.g. `new F()`
        "noarg": true,    // true: Prohibit use of `arguments.caller` and `arguments.callee`
        "sub": true,      // true: Tolerate using `[]` notation when it can still be expressed in dot notation
        "boss": true,     // true: Tolerate assignments where comparisons would be expected
        "eqnull": true,   // true: Tolerate use of `== null`
      },
      all: [
        'gruntfile.js',
        '<%= root.app %>/*.js'
      ]
    },
    jasmine: {
      src: '<%= root.build %>/stampsdk.js',
      options: {
        specs: 'test/*.spec.js'
      }
    },
    watch: {
      js: {
        files: [
          '<%= root.app %>/*.js', 
          '<%= root.app %>/lib/*.js',
          '<%= root.test %>/*.spec.js',
          'wrap/wrap.*',
          'app.html'
        ],
        tasks: [
          'jshint', 
          'jasmine', 
          'requirejs'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', [
    'jshint',
    'requirejs',
    'jasmine',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'requirejs',
    'jasmine'
  ]);
};