let baseConf = require('./karma.conf.base')
module.exports = function (config) {
  baseConf('app')(config)
}
