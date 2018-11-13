module.exports = function (grunt) {
  grunt.config.set('sails-linker', {
    devJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: 'www',
        relative: true
      },
      files: {
        'www/index.html': require('../pipeline').jsFilesToInject.map(x => 'www/' + x),
        'assets/index.html': require('../pipeline').jsFilesToInject.map(x => 'www/' + x)
      }
    },
    prodJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: 'www',
        relative: true
      },
      files: {
        'www/index.html': ['www/js/production.min.js']
      }
    },

    devStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: 'www',
        relative: true
      },
      files: {
        'www/index.html': require('../pipeline').cssFilesToInject.map(x => 'www/' + x),
        'assets/index.html': require('../pipeline').cssFilesToInject.map(x => 'www/' + x)
      }
    },

    prodStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: 'www',
        relative: true
      },
      files: {
        'www/index.html': ['www/css/production.min.css']
      }
    }
  })

  grunt.loadNpmTasks('grunt-sails-linker')
}
