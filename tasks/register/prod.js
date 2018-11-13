module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'clean:www',
    'copy:prod',
    'concat',
    'uglify',
    'cssmin',
    'clean:prod',
    'sails-linker:prodJs',
    'sails-linker:prodStyles'
  ])
}
