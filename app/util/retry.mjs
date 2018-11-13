import _ from 'lodash'

export function Retry (popupFn, checkFn) {
  this.check = checkFn
  this.openPopup = popupFn
  this.retryList = []
  this.setOpenPopup()
}

Retry.prototype = {
  setOpenPopup () {
    this.openPopupOnce = _.once(e => {
      this.openPopup(e).then(r => {
        if (r) {
          this.setOpenPopup()
          this.retryAll()
        } else {
          this.setOpenPopup()
          this.rejectAll()
        }
      })
    })
  },
  retryAll () {
    for (let retry of this.retryList.slice()) {
      if (retry.running) continue
      retry.running = true
      retry.fn().then(r => {
        if (retry.rejected) return // 끝나기 전에 rejectAll 된 경우
        _.pull(this.retryList, retry) // 성공 했으니 재시도에서 제거
        retry.resolve(r)
      }, e => {
        retry.running = false
        if (retry.rejected) return
        if (this.check(e)) {
          this.openPopupOnce(e) // 실패 했으니 재시도 팝업 재오픈
        } else {
          _.pull(this.retryList, retry) // 재시도 상태와 다른 에러로 실패 했으니 재시도에서 제거
          retry.reject(e)
        }
      })
    }
  },
  rejectAll () {
    for (let retry of this.retryList) {
      retry.rejected = true
      retry.reject(retry.err)
    }
    this.retryList = []
  },
  start (fn, err) {
    this.openPopupOnce(err)
    return new Promise((resolve, reject) => {
      this.retryList.push({fn, resolve, reject, running: false, err, rejected: false})
    })
  }
}
