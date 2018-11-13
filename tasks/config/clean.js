/**
 * `clean`
 *
 * ---------------------------------------------------------------
 *
 * Remove the files and folders in your Sails app's web root
 * (conventionally a hidden directory called `.tmp/public`).
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-clean
 *
 */
module.exports = function (grunt) {
  grunt.config.set('clean', {
    www: ['www/**/*', '!www/bundle.js*', '!www/files/**', '!www/.gitkeep'],
    prod: ['www/concat/**', 'www/files/**.map', 'www/**.map'],
    files: ['www/files/**']
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
}
