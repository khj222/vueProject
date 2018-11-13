import popup from './popup'
import login from '~/popup/login/login'
import axios from 'axios'
import _ from 'lodash'
import loadingService from '~/common/loading/service'
import alert from '~/popup/alert/alert'
import { Retry } from '~/util/retry.mjs'

const axiosLongTimeout = axios.create({
  timeout: 180000
})

let method = {
  post(url, data, config) {
    // console.info(url, data)
    // console.log(urlList.hasOwnProperty(url))
    if (url.indexOf('.do') > -1) {
      config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      // var formData = new window.FormData()
      // Object.keys(data).forEach(key => formData.append(key, data[key]))
      // data = formData
      // console.log('======>', data)
      if (!_.isEmpty(data)) {
        data = Object.keys(data)
          .map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
          })
          .join('&')
      }
    }

    return (url === '/uploadFile' ? axiosLongTimeout : axios)
      .post(url, data, config)
      .then(_.property('data'))
  },
  get(url, data, config) {
    // console.log(url, data)
    return axios
      .get(
        url,
        _.assign({}, config, {
          params: data
        })
      )
      .then(_.property('data'))
  },
  put(url, data, config) {
    return axios.put(url, data, config).then(_.property('data'))
  },
  delete(url, data, config) {
    return axios
      .delete(
        url,
        _.assign({}, config, {
          params: data
        })
      )
      .then(_.property('data'))
  }
}

let noneBlockMode = false
let urls = []
let n = 0
let dequeue = function(tf) {
  return function(r) {
    n--
    if (n <= 0) {
      urls = []
      n = 0
    }
    return tf ? r : Promise.reject(r)
  }
}
let enqueue = function(url) {
  if (!noneBlockMode) urls.push(url)
  n++
}

let retry = new Retry(
  e => {
    // console.log(e.targetUrl)
    let msg = '\n네트워크 상태를 확인하거나 \n잠시 후 다시 시도해주세요.'
    if (e instanceof Error && /^timeout/.test(e.message)) {
      msg = '연결 시간이 초과 되었습니다.' + msg
    } else {
      msg = '일시적인 서버 오류로 인해 데이터를 가져올 수 없습니다.' + msg
    }
    let btList = [
      {
        text: '재시도',
        value: true
      },
      {
        text: '취소',
        value: false
      }
    ]
    // insert API 에서는 재시도 버튼 제거
    if (String(e.targetUrl).indexOf('insert') !== -1) {
      btList = [
        {
          text: '취소',
          value: false
        }
      ]
    }

    return popup
      .open(alert, {
        msg,
        btnList: btList
      })
      .then(r => r.btn.value)
  },
  e =>
    !e.response ||
    e.response.status === 408 ||
    e.response.status === 503 ||
    (e instanceof Error && /^timeout/.test(e.message))
)

let retryLogin = new Retry(
  () =>
    popup
      .open(alert, {
        msg: '접근 권한이 없습니다.\n로그인 페이지로 이동하시겠습니까?',
        btnList: [
          {
            text: '이동',
            value: true
          },
          {
            text: '취소',
            value: false
          }
        ]
      })
      .then(
        r =>
          r.btn.value &&
          popup.open(login, null, null, {
            ignoreSkipOpen: true
          })
      ),
  e => e.response.status === 403
)

let cache = {}
let clearTimeout = {}

function Handler(url, idParam, noLoading, cacheTime) {
  Object.assign(this, {
    url,
    idParam,
    noLoading,
    cacheTime
  })
}

Handler.prototype.requestToServer = function(url, data, config) {
  if (this.noLoading === true) return this.request(url, data, config)
  // console.log(urls, url)
  // getEmpWorkHoliTamDay 달 현황목록은 3번씩 불러야하므로 예외처리
  // ['200', '300', '100', '250', '350'].some(e => e === v.APPL_STAT)
  let exceptionArr = [
    '/hns/personnel/appform/overtimeapp/getOverTimeAppList.json',
    '/hns/personnel/appform/workholiapp/getWorkHoliAppList.json',
    '/hns/personnel/appform/workholiapp/getEmpWorkHoliTamDay.json',
    '/hns/personnel/appform/workholiapp/reqWorkHoliApp.do',
    '/hns/pay/paymng/paycalcresult/getPcmPayPerRstInfo.json',
    '/hns/personnel/appform/overtimeapp/getWorkHoliDayView.json',
    '/sym/program/getCommonCodeIdxDtlList.json',
    '/hns/edu/edured/getEduCoseList.json',
    '/commFile/downloadAppFiles.do'
  ]
  if (exceptionArr.some(e => e === url)) {
  } else {
    if (urls.indexOf('get:' + url) > -1) return // Promise.reject(new Error('already running'))
  }

  enqueue('get:' + url)
  return loadingService.show(this.request(url, data, config)).then(dequeue(1), dequeue(0))
}

Handler.prototype.handle = function(data, config, rejectImmediate) {
  let { idParam, cacheTime, noLoading } = this
  let targetUrl = this.url

  if (_.isNil(data)) void 0
  else if (!_.isObject(data)) {
    targetUrl += '/' + data
    data = undefined
  } else if (idParam && data[idParam]) {
    targetUrl += '/' + data[idParam]
    data = _.omit(data, idParam)
  }

  if (cacheTime > 0 && cache[targetUrl]) return cache[targetUrl]
  let promise = this.requestToServer(targetUrl, data, config).catch(e => {
    delete cache[targetUrl]
    if (noLoading || rejectImmediate) return Promise.reject(e)
    e.targetUrl = targetUrl
    if (retry.check(e)) {
      return retry.start(() => this.requestToServer(targetUrl, data, config, noLoading), e)
    } else if (e.response.status === 501) {
      return popup
        .open(alert, {
          msg: e.response.data || '준비중인 서비스 입니다.'
        })
        .then(() => Promise.reject(e))
    } else if (retryLogin.check(e)) {
      return retryLogin.start(() => this.requestToServer(targetUrl, data, config), e)
    } else {
      return Promise.reject(e)
    }
  })

  // promise.then(r => {
  //   if (r.status && (r.status !== 'ok' && r.status !== 'OK')) {
  //     return popup
  //       .open(alert, {
  //         msg: r.result || r.msg
  //       })
  //       .then(() => Promise.reject(r))
  //   }
  //   Promise.resolve(r)
  // })

  if (cacheTime > 0) {
    cache[targetUrl] = promise
    clearTimeout[targetUrl] = setTimeout(
      function() {
        delete cache[targetUrl]
      },
      cacheTime,
      false
    )
  }
  return promise
}
Handler.prototype.method = function(type) {
  this.request = type
  if (this.request !== method.get || this.idParam) this.cacheTime = null // get이면서 idParam이 없는 경우만 캐싱함
  let self = this
  return function(data, config, rejectImmediate) {
    return self.handle(data, config, rejectImmediate)
  }
}

let clearCache = function(url, idParam) {
  return function(data) {
    let targetUrl = url
    if (_.isNil(data)) void 0
    else if (!_.isObject(data)) targetUrl += '/' + data
    else if (idParam && data[idParam]) targetUrl += '/' + data[idParam]
    setTimeout.cancel(clearTimeout[targetUrl])
    delete clearTimeout[targetUrl]
    delete cache[targetUrl]
  }
}

export default {
  get(id, param, noLoading, cacheTime) {
    return new Handler(...arguments).method(method.get)
  },
  post(id, param, noLoading, cacheTime) {
    return new Handler(...arguments).method(method.post)
  },
  put(id, param, noLoading, cacheTime) {
    return new Handler(...arguments).method(method.put)
  },
  delete(id, param, noLoading, cacheTime) {
    return new Handler(...arguments).method(method.delete)
  },
  clearCache: clearCache
}
