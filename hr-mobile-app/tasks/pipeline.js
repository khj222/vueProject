/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */

var cssFilesToInject = [
  'css/**/*.css'
]

var jsFilesToInject = [
  'js/**/*.css'
]

module.exports.cssFilesToInject = cssFilesToInject
module.exports.jsFilesToInject = jsFilesToInject
