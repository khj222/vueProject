module.exports = function (grunt) {
  grunt.config.set('uglify', {
    dist: {
      src: ['www/concat/production.js'],
      dest: 'www/js/production.min.js'
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
}
