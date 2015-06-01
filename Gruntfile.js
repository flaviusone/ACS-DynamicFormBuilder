module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      app: {
        src: ['posts/static/js/react/**/*.js'],
        dest: 'posts/static/js/react_code_jsx.js'
      }
    },
    react: {
      single_file_output: {
        files: {
          'posts/static/js/react_code.js': 'posts/static/js/react_code_jsx.js'
        }
      }
    },
    watch: {
            options: {livereload: true},
            javascript: {
                files: ['posts/static/js/react/**/*.js'],
                tasks: ['concat','react']
            }
    }

  });

  // Load plugins here.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');
  // Register tasks here.
  grunt.registerTask('default', []);

};