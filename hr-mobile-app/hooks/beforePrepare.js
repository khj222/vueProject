const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const grunt = require('grunt')
const gruntfile = require('../Gruntfile')
const fs = require('fs')
module.exports = function (context) {
  if (!fs.existsSync('www')) fs.mkdirSync('www')
  let prod = context.cmdLine.includes('--release')
  let hasIndex = fs.existsSync('www/index.html')
  let promise = Promise.resolve()
  if (!hasIndex || prod) { // index.html이 없거나 prod 모드면 grunt 실행
    gruntfile(grunt)
    console.log('grunt run task : ' + prod ? 'prod' : 'default')
    promise = new Promise(resolve => grunt.tasks(prod ? ['prod', 'clean:files'] : ['default'], {}, resolve))
  }
  return promise.then(function () {
    return new Promise((resolve, reject) => {
      webpack(webpackConfig({prod}), (err, stats) => {
        let log = stats.toString({colors: true})
        console.log(log);
        (err || stats.hasErrors()) ? reject(log) : resolve(log)
      })
    })
  })
}
