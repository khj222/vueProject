module.exports = function (grunt) {
  grunt.config.set('concat', {
    js: {
      src: require('../pipeline').jsFilesToInject.map(x => 'assets/' + x),
      dest: 'www/concat/production.js'
    },
    css: {
      src: require('../pipeline').cssFilesToInject.map(x => 'assets/' + x),
      dest: 'www/concat/production.css'
    }

  })

  grunt.loadNpmTasks('grunt-contrib-concat')
}
