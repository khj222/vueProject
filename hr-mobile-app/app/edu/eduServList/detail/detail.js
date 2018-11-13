import req2svr from '../req2svr'
import moment from 'moment'
import alert from '~/popup/alert/alert'

export default {
  name: 'eduServPart',
  props: ['coseServData'],
  inject: ['popup'],
  provide: {
    req2svr
  },
  computed: {
    req2svr: () => req2svr,
    noResult() {
      return this.list.length <= 0
    }
  },
  data() {
    return {
      spin: true,
      list: [],
      formData: {
        TUTE_ID: '',
        servOptnList: [],
        servCommList: []
      },
      arr: {},
      tutoList: {}
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr
        .popServPart({
          COSE_ID: this.coseServData.COSE_ID,
          COSE_OPEN_ID: this.coseServData.COSE_OPEN_ID,
          TUTE_ID: this.coseServData.TUTE_ID,
          I_SRCH_AUTH: '40'
        })
        .then(r => {
          this.tutoList = r
          var tutoLength = this.tutoList.TUTO_ID ? this.tutoList.TUTO_ID.length : 0

          this.req2svr
            .getEduServItemList({
              TUTE_ID: this.coseServData.TUTE_ID,
              SERV_ID: this.coseServData.SERV_ID,
              ITEM_ORDERBY: 'Y',
              pageIndex: 1
            })
            .then(
              r => {
                if (r.data && r.data.length > 0) {
                  this.list = r.data
                  let x = 0
                  let y = 0

                  _.forEach(r.data, (v, i) => {
                    // 과정의 객관식인 경우
                    if (v.ITEM_CLS === '100' && v.ITEM_KIND !== '900') {
                      this.formData.servOptnList[y] = {
                        SERV_ITEM_ID: v.SERV_ITEM_ID + '',
                        TUTO_ID: '0',
                        ITEM_ANS: ''
                      }
                      y++
                      // 과정의 주관식인 경우
                    } else if (v.ITEM_CLS === '100' && v.ITEM_KIND === '900') {
                      this.formData.servCommList[x] = {
                        SERV_ITEM_ID: v.SERV_ITEM_ID + '',
                        TUTO_ID: '0',
                        ITEM_STR: '',
                        ITEM_WEK: ''
                      }
                      x++
                      // 강사의 객관식인 경우
                    } else if (v.ITEM_CLS === '200' && v.ITEM_KIND !== '900') {
                      for (let i = 0; i < tutoLength; i++) {
                        this.formData.servOptnList[y] = {
                          SERV_ITEM_ID: v.SERV_ITEM_ID + '',
                          TUTO_ID: this.tutoList.TUTO_ID[i] + '',
                          ITEM_ANS: ''
                        }
                        y++
                      }
                      // 강사의 주관식인 경우
                    } else if (v.ITEM_CLS === '200' && v.ITEM_KIND === '900') {
                      for (let i = 0; i < tutoLength; i++) {
                        this.formData.servCommList[x] = {
                          SERV_ITEM_ID: v.SERV_ITEM_ID + '',
                          TUTO_ID: this.tutoList.TUTO_ID[i] + '',
                          ITEM_STR: '',
                          ITEM_WEK: ''
                        }
                        x++
                      }
                    }

                    v.ITEM_KEY = v.ITEM_KIND_NM + '|' + v.ITEM_KIND + '|' + v.ITEM_CLS
                  })
                  // let xx = 0
                  // let yy = 0
                  // _.forEach(this.list, (v, i) => {
                  //   if (v.ITEM_KIND !== '900') {
                  //     v.optnListNo = xx
                  //     xx++
                  //   } else {
                  //     v.commListNo = yy
                  //     yy++
                  //   }
                  // })

                  this.arr = _
                    .chain(this.list)
                    .groupBy('ITEM_CLS')
                    .map(o => {
                      return _
                        .chain(o)
                        .groupBy('ITEM_KEY')
                        .toPairs()
                        .map(o => {
                          return _.zipObject(['ITEM_KEY', 'data'], o)
                        })
                        .value()
                    })
                    .value()
                  if (tutoLength > 0 && this.arr[1]) {
                    for (let i = 0; i < tutoLength; i++) {
                      let copyA = _.cloneDeep(this.arr[1])
                      copyA.TUTO_ID = this.tutoList.TUTO_ID[i]
                      copyA.TUTO_NM = this.tutoList.TUTO_NM[i]
                      this.arr.push(copyA)
                    }
                    _.pullAt(this.arr, 1)
                  }
                  let xx = 0
                  let yy = 0
                  _.forEach(this.arr, (v1, i1) => {
                    _.forEach(v1, (v2, i2) => {
                      _.forEach(v2.data, (v3, i3) => {
                        if (v3.ITEM_KIND !== '900') {
                          v3.optnListNo = xx
                          xx++
                        } else {
                          v3.commListNo = yy
                          yy++
                        }
                      })
                    })
                  })
                }
                if (this.spin) {
                  this.spin = false
                }
              },
              () => {
                if (this.spin) {
                  this.spin = false
                }
              }
            )
        })
    }, 0)
  },
  beforePopup(done) {
    return done()
  },
  methods: {
    saveEduServPart() {
      let msg = '응답하지 않은 설문이 존재합니다.'
      let isValid = true
      _.forEach(this.formData.servCommList, v => {
        if (v.ITEM_STR === '' || v.ITEM_WEK === '') {
          isValid = false
          return false
        }
      })
      _.forEach(this.formData.servOptnList, v => {
        if (v.ITEM_ANS === '') {
          isValid = false
          return false
        }
      })
      if (!isValid) {
        return this.popup.open(alert, {
          msg,
          btnList: [
            {
              text: '확인',
              value: true
            }
          ]
        })
      }
      this.formData.TUTE_ID = this.coseServData.TUTE_ID + ''

      this.req2svr.saveEduServPart(this.formData).then(r => {
        this.popup
          .open(alert, {
            msg: r.result,
            btnList: [
              {
                text: '확인',
                value: true
              }
            ]
          })
          .then(rx => {
            if (r.status === 'ok') {
              this.$parent.$options.methods.filterList()
              this.$emit('closePop', true)
            }
          })
      })
    }
  },
  templateSrc: './detail.html'
}
