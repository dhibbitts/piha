module.exports = function (grunt) {
  var fs = require('fs');

  var uglify_options = {
    options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    },
    build: {
      src: 'src/assets/js/app.js',
      dest: 'build/assets/js/app.js'
    }
  };

  var jshint_options = {
    files: ['gruntfile.js', 'src/assets/js/*'],
    options: grunt.file.readJSON('.jshintrc')
  };

  var hash_options = {
    options: {
      output: 'asset_map.json',
      merge: true
    },
    js: {
      cwd: 'build/assets/js/',
      src: '*.js',
      dest: 'dist/assets/js/'
    },
    css: {
      cwd: 'build/assets/css/',
      src: '*.css',
      dest: 'dist/assets/css/'
    }
  };


  var less_options = {
    production: {
      options: {
        paths: ["/"],
        yuicompress: true
      },
      files: {
        "build/assets/css/app.css": "src/assets/css/app.less"
      }
    }
  };

  var copy_options = {
    build: {
      files: [{
        expand: true,
        flatten: true,
        src: ['build/button.html', 'src/assets/js/adn.js', 'src/test.html'],
        dest: 'dist/'
      }]
    }
  };

  var watch_options = {
    css: {
      files: ['src/assets/css/app.less'],
      tasks: ['build']
    },
    js: {
      files: jshint_options.files,
      tasks: ['build']
    },
    html: {
      files: ["src/button.jade"],
      tasks: ['build']
    },
    test: {
      files: ["src/test.html"],
      tasks: ['build']
    }
  };

  var connect_options = {
    server: {
      options: {
        port: 9001,
        base: './dist'
      }
    }
  };

  var jade_options = {
    compile: {
      options: {
        data: {
          assets: function () {
            return grunt.file.readJSON('asset_map.json');
          },
          title: "awesoem town"
        }
      },
      files: {
        "build/button.html": ["src/button.jade"]
      }
    }
  };

  var amazon_conf = {};
  try {
    amazon_conf = grunt.file.readJSON('amazon.json');
  } catch (e) {}

  var deploy_options = {
    heroku: true,
    amazon: amazon_conf
  };


  var exec_options = {
    heroku_deploy: {
      cmd: 'heroku-push ./dist'
    },
    echo_name: {
      cmd: function (firstName, lastName) {
        var formattedName = [
          lastName.toUpperCase(),
          firstName.toUpperCase()
        ].join(', ');

        return 'echo ' + formattedName;
      }
    }
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: uglify_options,
    jshint: jshint_options,
    hashmap: hash_options,
    less: less_options,
    copy: copy_options,
    connect: connect_options,
    jade: jade_options,
    watch: watch_options,
    clean: ['./build', './dist'],
    exec: exec_options,
    deploy: deploy_options
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-hashmap');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('ensure_folders', function () {
    var folders = ['./dist/assets', './build/assets'];
    folders.forEach(function (folder) {
      grunt.file.mkdir(folder);
    });
  });

  grunt.registerMultiTask('deploy', "deploy your button", function () {
    if (this.target === 'amazon' && !this.data.bucket) {
      grunt.log.error('To deploy to amazon you must create an amazon.json with the appropriate info');
      return false;
    }

    if (this.target === 'heroku') {
      grunt.task.run('exec:heroku_deploy');
    }
  });

  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('build', ['ensure_folders', 'jshint', 'uglify', 'less', 'hashmap', 'jade', 'copy']);
  grunt.registerTask('dev', ['build', 'connect', 'watch']);
};