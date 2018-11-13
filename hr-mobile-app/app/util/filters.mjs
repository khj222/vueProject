import Vue from 'vue'
import moment from 'moment'
import constant from '@constant'
import _ from 'lodash'

Vue.filter('replaceFileUrl', x => x && x.replace(/(['"])(\/downloadFile\?file_id=)/g, '$1' + constant.baseURL + '$2'))
Vue.filter('fileUrl', fileId => `${constant.baseURL}/commFile/downloadAppFiles.do?fFILE_NO=${fileId}`)

const momentConstructor = moment().constructor
Vue.filter('date', (v, ...args) => {
  let toFormat = args.shift() || 'YYYY-MM-DD'
  if (v && v.constructor === momentConstructor) return v.format(toFormat)
  return moment(v, ...args).format(toFormat)
})
Vue.filter('dateLocale', (v, locale, ...args) => {
  let toFormat = args.shift() || 'YYYY-MM-DD'
  if (v && v.constructor === momentConstructor) return v.clone().locale(locale).format(toFormat)
  return moment(v, ...args).locale(locale).format(toFormat)
})
Vue.filter('numberComma', n => `${n || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','))

_.forEach(
  [
    'ceil',
    'floor',
    'max',
    'maxBy',
    'mean',
    'meanBy',
    'min',
    'minBy',
    'round',
    'sum',
    'sumBy',
    'clamp',
    'camelCase',
    'capitalize',
    'endsWith',
    'escape',
    'escapeRegExp',
    'kebabCase',
    'lowerCase',
    'lowerFirst',
    'pad',
    'padEnd',
    'padStart',
    'parseInt',
    'repeat',
    'replace',
    'snakeCase',
    'split',
    'startCase',
    'startsWith',
    'template',
    'toLower',
    'toUpper',
    'trim',
    'trimEnd',
    'trimStart',
    'truncate',
    'unescape',
    'upperCase',
    'upperFirst',
    'words'
  ],
  fn => Vue.filter(fn, _[fn])
)
