module.exports = function(grunt) {
  var myModuleFiles = [
    './dist/js/stampsdk.js',
    './test/test-main.js'
  ];
  var libraryFiles = [
    './dist/js/lib/require.js',
    //'./dist/js/lib/almond.js',
    './dist/js/lib/json3.js',
    './dist/js/lib/util.js',
    './dist/js/lib/handjs-1.8.3.js',
    './dist/js/lib/jquery.min.js'
  ];
  grunt.initConfig({
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
    // sass: {
    //   dist: {
    //     sourcemap: true,
    //     options: {
    //       unixNewlines: true
    //     },
    //     files: [{
    //       src: 'scss/sdk.scss',
    //       dest: 'css/sdk.css'
    //     }]
    //   }
    // },
    // karma: {
    //   options: {
    //     configFile: 'karma.conf.js',
    //     frameworks: ['jasmine'],
    //     port: 8090,
    //     background: true,
    //     files: myModuleFiles.concat(libraryFiles)
    //   },
    //   unit: {
    //     runnerPort: 8089,
    //     colors: true,
    //     logLevel: 'ERROR',
    //     autoWatch: false,
    //     browsers: ['Chrome', 'Firefox', 'Safari', 'Opera', 'PhantomJS', 'IE', 'ChromeCanary'],
    //     singleRun: true,
    //     loadFiles: myModuleFiles.concat(libraryFiles)
    //   }
    // },
    watch: {
      js: {
        files: ['src/*.js', 'src/lib/*.js', 'app.html'],
        tasks: ['requirejs']
      }
      // sass: {
      //   files: ['ui/static/scss/**/*.scss'],
      //   tasks: ['sass', 'shell:cpSass']
      // }
      // karma: {
      //   files: [
      //     'test/*.js',
      //     'test/**/*.js',
      //     'test/**/**/*.js',
      //     'build/js/**/*.js',
      //     'build/js/*.js'
      //   ],
      //   tasks: ['karma:unit:run']
      // }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  //grunt.loadNpmTasks('grunt-contrib-sass');
  //grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('default', ['requirejs', 'watch']);
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