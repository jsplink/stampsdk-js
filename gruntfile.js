module.exports = function(grunt) {
  grunt.initConfig({
    root: {
      app: 'src',
      test: 'test'
    },
    connect: {
      test : {
        port : 8000
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          almond: true,
          mainConfigFile: "./requirejs-config.json",
          skipDirOptimize: true,
          optimize: "none",
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
      test: {
        vendor: ['<%= root.test %>/lib/mock-ajax.js'],
        options: {

          specs: '<%= root.test %>/*.spec.js',
          //helpers: '<%= root.test %>/helpers/*.js',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: ['requirejs-config.json'], 
            requireConfig: {
              paths: {'mock-ajax': '../test/lib/mock-ajax'}
            }
          }
        }
      }
    },
    watch: {
      js: {
        files: ['src/*.js', 'src/lib/*.js', 'app.html'],
        tasks: ['test', 'jshint', 'requirejs']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', [
    'jasmine'
  ]);

  //grunt.loadNpmTasks('grunt-template-jasmine-requirejs');
  grunt.registerTask('default', ['jasmine', 'jshint', 'requirejs', 'watch']);
};

// options: {
//   configFile: 'karma.conf.js',
//   runnerPort: 8089
// },
// unit: {
//   configFile: 'karma.conf.js',
//   background: true,
//   runnerPort: 8089
// },
// continuous: {
//   singleRun: true,
//   logLevel: 'DEBUG'
// },
// dev: {
//   reporters: 'dots'
// }