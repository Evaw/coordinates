/*global module, require*/
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');

  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks
  const initMinify = 'node ./node_modules/google-closure-compiler-js/cmd.js';
  const minifyCommand = [
    initMinify + ' ./bin/js/popup.js > ./bin/js/popup.min.js;',
    initMinify + ' ./bin/js/content-script.js > ./bin/js/content-script.min.js;',
    initMinify + ' ./bin/js/options.js > ./bin/js/options.min.js;',
    'mv ./bin/js/popup.min.js ./bin/js/popup.js;',
    'mv ./bin/js/content-script.min.js ./bin/js/content-script.js;',
    'mv ./bin/js/options.min.js ./bin/js/options.js;',

  ].join(' ');
  let gconfig = {
    shell: {
      minify: {
        command: minifyCommand
      }
    },
    clean: {
      main: ['bin']
    },
    webpack: {
      optionsPage: {
        entry: './src/js/options.js',
        output: {
          path: './bin/js',
          filename: 'options.js'
        },
        module: {
          loaders: [{
            test: /\.js/,
            loader: 'babel-loader'
          }]
        },
        watch: true
      },
      contentScript: {
        entry: './src/js/content-script.js',
        output: {
          path: './bin/js',
          filename: 'content-script.js'
        },
        module: {
          loaders: [{
            test: /\.js/,
            loader: 'babel-loader'
          }]
        },
        watch: true
      },
      popup: {
        entry: './src/js/popup.js',
        output: {
          path: './bin/js',
          filename: 'popup.js'
        },
        module: {
          loaders: [{
            test: /\.js/,
            loader: 'babel-loader'
          }]
        },
        watch: true
      }
    },
    watch: {
      manifest: {
        files: './src/manifest.json',
        tasks: ['copy:manifest']
      },
      // scripts: {
      //   files: './src/js/**/*.js',
      //   tasks: ['eslint', 'webpack']
      // },
      copyHtml: {
        files: './src/html/**/*.html',
        tasks: ['copy:html']
      },
      copyImages: {
        files: 'src/img/**/*',
        tasks: ['copy:img']
      }
    },
    copy: {
      /* main: {
          files: [
            // includes files within path and its sub-directories
            {
              expand: true,
              cwd: 'src',
              src: ['**'],
              dest: 'bin/',
              filter: function (filePath) {
                // console.log(arguments);
                return path.extname(filePath) !== '.js';
              }
            }
          ]
       },
      */
      manifest: {
        files: [
          {
            src: 'src/manifest.json',
            dest: 'bin/manifest.json'
          }
        ]
      },
      html: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['html/*.html'],
            dest: 'bin/'
          }
        ]
      },
      img: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['img/**/*'],
            dest: 'bin/'
          }
        ]
      }
    },
    eslint: {
      main: {
        src: ['src/js/**/*.js']
      }
    }
  };
  grunt.initConfig(gconfig);
  grunt.registerTask('default', ['clean', 'copy', 'webpack', 'shell:minify']);
  grunt.registerTask('dev', ['default', 'watch']);
};
