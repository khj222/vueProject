let baseConf = require('./karma.conf.base')
module.exports = function (config) {
  baseConf('app')(config)
  config.set({
    reporters: ['mocha', 'coverage'],
    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
      'karma-chrome-launcher'
    ]
  })
}
