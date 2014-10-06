module.exports = function(grunt) {
  // require('load-grunt-tasks')(grunt, {
  //   pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']
  // });
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    verbose: true,
    root: {
      app: 'src',
      test: 'test',
      build: 'build',
      dist: 'dist'
    },
    connect: {
      server: {
        options: {
          port : 8000
        }
      }
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
      tests: {
        build: {
          options: {
            outfile: '<%= root.test %>/SpecRunner.build.html',
            keepRunner: true,
            host : 'http://127.0.0.1:8000/',
            build: true,
            specs: '<%= root.test %>/*.spec.js',
            template: require('grunt-template-jasmine-requirejs'),
            templateOptions: {
              requireConfigFile: ['requirejs-config.json'],
              requireConfig: {
                paths: {
                  'stampsdk.min': '../build/stampsdk'
                }
              }
            }
          }
        } /** @TODO dist tests */
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
          'jasmine:tests:build', 
          'jshint', 
          'requirejs'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('jasmine_serve', 
    'start web server for jasmine tests in browser', 
  function() {
    grunt.task.run('jasmine:tests:build');

    grunt.event.once('connect.server.listening', function(host, port) {
      var specRunnerUrl = 'http://' + host + ':' + port + '/_SpecRunner.html';
      grunt.log.writeln('Jasmine specs available at: ' + specRunnerUrl);
      require('open')(specRunnerUrl);
    });

    grunt.task.run('connect:server:keepalive');
  });

  grunt.registerTask('default', [
    'jshint', 
    'requirejs',
    'jasmine:tests:build', 
    'watch'
  ]);

  grunt.registerTask('build', [
    'jasmine:tests:build', 
    'jshint', 
    'requirejs'
  ]);  

  grunt.registerTask('test', [
    'jshint',
    'jasmine:tests:build',
    'jasmine_serve'
  ]);
};