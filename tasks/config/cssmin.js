module.exports = function (grunt) {
  grunt.config.set('cssmin', {
    dist: {
      src: ['www/concat/production.css'],
      dest: 'www/css/production.min.css'
    }
  })

  grunt.loadNpmTasks('grunt-contrib-cssmin')
}
