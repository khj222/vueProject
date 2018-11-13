const webpackConfig = require('../webpack.config.base')
module.exports = function (name) {
  return function (config) {
    let webpackConf = webpackConfig(name)
    webpackConf.module.rules.push({
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        plugins: [['istanbul', {exclude: ['test/']}]]
      }
    })
    config.set({
      frameworks: ['jasmine'],
      files: [`./${name}/test.js`],
      preprocessors: {
        [`./${name}/test.js`]: ['webpack', 'sourcemap']
      },
      singleRun: true,
      plugins: [
        'karma-jasmine',
        'karma-mocha-reporter',
        'karma-sourcemap-loader',
        'karma-webpack',
        'karma-chrome-launcher'
      ],
      autoWatch: false,
      browsers: ['Chrome'],
      reporters: ['mocha'],
      coverageReporter: {
        reporters: [
          {type: 'lcov', dir: `../coverage`, subdir: name},
          {type: 'text-summary', dir: `../coverage`, subdir: name}
        ]
      },
      webpack: webpackConf,
      webpackMiddleware: {
        noInfo: true
      }
    })
  }
}
