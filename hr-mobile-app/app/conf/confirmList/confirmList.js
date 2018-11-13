import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import alert from '~/popup/alert/alert'
import popupMenu from '~/popup/menu/menu'
import search from './search/search'
import Vue from 'vue'
let mock = {
  CD_IDX_CHK: 'on',
  APPL_CD: '100003',
  REQ_NO: '139775',
  EDIT_FLAG: 'Y',
  APPL_NM: '초과근무신청서',
  REQ_YMD: '2018-04-10',
  STA_YMD: '2018-04-10',
  STA_HMS: '20:00',
  END_YMD: '2018-04-10',
  END_HMS: '23:00',
  REQ_EMP_NO: '1104796',
  REQ_EMP_NM: '남민협',
  REQ_ORG_NM: '경북동부홈고객센터',
  TRG_EMP_NO: '1104796',
  TRG_EMP_NM: '남민협',
  TRG_ORG_NM: '경북동부홈고객센터',
  APPL_STAT_NM: '결재중',
  FNL_APPR_YMD: '',
  REASON: 'fd'
}
let execMock = {
  APPL_CD: '',
  WORK_CD: '10',
  APPR_EMP_NO1: '',
  APPR_EMP_NO2: '',
  APPR_EMP_NO3: '',
  APPR_CLS1: '',
  APPR_CLS2: '',
  APPR_CLS3: '',
  REQ_NO: '287649',
  TRG_PERSON_ID: '',
  TRG_EMP_NO: '1101106',
  TRG_EMP_NM: '임성민',
  TAM_SHIFT_STA_HMS: '09:00',
  TAM_SHIFT_END_HMS: '18:00',
  STA_YMD: '2018-05-13',
  STA_HMS: '1800',
  STA_HH: '18',
  STA_MM: '00',
  EXPT_HMS: '0',
  END_YMD: '2018-05-13',
  END_HMS: '1900',
  END_HH: '19',
  END_MM: '00',
  REASON: '동일시간등록테스트1'
}
export default {
  name: 'confirmList',
  inject: ['popup'],
  components: {
    InfiniteLoading
  },
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
      list: [],
      dataList: [],
      SEARCH_STA_DATE: moment()
        .startOf('day')
        .add(-2, 'month')
        .format('YYYY-MM-DD'),
      SEARCH_END_DATE: moment()
        .startOf('day')
        .add(1, 'month')
        .format('YYYY-MM-DD'),
      selectedId: -1,
      SEARCH_APPL_STAT: '',
      spin: true,
      bus: new Vue(),
      SEARCH_TRG_PERSON_ID: '',
      SEARCH_TRG_EMP_NO: '',
      SEARCH_TRG_EMP_NM: '',
      detailData: {},
      SEARCH_APPL_CHK: '',
      times: [],
      isChange: false
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
    }, 0)
  },
  beforeTransitionLeave() {},
  mounted() {
    this.$store.dispatch('getCountList', 'CONFIRMLIST')
    this.bus.$on('setMember', x => {
      // console.log(x)
      this.SEARCH_TRG_PERSON_ID = x.PERSON_ID
      this.SEARCH_TRG_EMP_NO = x.EMP_NO
      this.SEARCH_TRG_EMP_NM = x.EMP_NM
      this.filterList()
    })
  },
  methods: {
    checkChange() {
      this.isChange = true
    },
    isConfirmed(item) {
      // 900: 승인, 990: 반려, 250:승인
      return (
        item.APPL_STAT_NM === '승인완료' ||
        item.APPL_STAT_NM === '승인' ||
        item.APPL_STAT_NM === '반려'
      )
    },
    openSearch() {
      this.popup.open(
        search,
        {
          bus: this.bus
        },
        this
      )
    },
    approve(item) {
      var res = {}
      var rawData = item
      _.forEach(_.intersection(_.keys(rawData), _.keys(mock)), o => {
        var c = _.find(rawData, (v, i) => {
          return i === o
        })
        res[o] = c + ''
      })
      let data
      let msg = ''
      if (this.isChange === true) {
        rawData = item
        var execRes = {}
        _.forEach(_.intersection(_.keys(rawData), _.keys(execMock)), o => {
          var c = _.find(rawData, (v, i) => {
            return i === o
          })
          execRes[o] = c + ''
        })
        execRes.STA_HH = rawData.STA_HMS.split(':')[0]
        execRes.STA_MM = rawData.STA_HMS.split(':')[1]
        execRes.STA_HMS = rawData.STA_HMS.split(':')[0] + rawData.STA_HMS.split(':')[1]

        execRes.END_HH = rawData.END_HMS.split(':')[0]
        execRes.END_MM = rawData.END_HMS.split(':')[1]
        execRes.END_HMS = rawData.END_HMS.split(':')[0] + rawData.END_HMS.split(':')[1]

        execRes.TAM_SHIFT_END_HMS = this.detailData.TAM_SHIFT_END_HMS
        execRes.TAM_SHIFT_STA_HMS = this.detailData.TAM_SHIFT_STA_HMS

        execRes.EXPT_HMS = this.detailData.EXPT_HMS
        execRes.WORK_CD = '10'

        let execData = execRes
        this.req2svr.execOverTimeAppChk(execData).then(r => {
          msg = r.msg
          if (r.result === 'OK') {
            this.req2svr.insertOverTimeApp(execData).then(r2 => {
              msg = r2.result
              if (r2.status === 'ok') {
                item.CD_IDX_CHK = 'on'
                data = { List: [res] }
                this.req2svr.reqAppApprApprove(data).then(r3 => {
                  msg = r3.result
                  this.popup
                    .open(alert, {
                      msg
                    })
                    .then(d => {
                      this.filterList()
                    })
                })
              } else {
                this.popup.open(alert, {
                  msg
                })
              }
            })
          } else {
            this.popup.open(alert, {
              msg
            })
          }
        })
      } else {
        item.CD_IDX_CHK = 'on'
        data = { List: [res] }
        this.req2svr.reqAppApprApprove(data).then(r => {
          msg = r.result
          this.popup
            .open(alert, {
              msg
            })
            .then(d => {
              this.filterList()
            })
        })
      }
    },
    reject(item) {
      item.CD_IDX_CHK = 'on'
      var res = {}
      _.forEach(_.intersection(_.keys(item), _.keys(mock)), o => {
        var c = _.find(item, (v, i) => {
          return i === o
        })
        res[o] = c + ''
      })
      let data = { List: [res] }

      this.req2svr.reqAppApprReturnP(data).then(r => {
        let msg = r.result
        this.popup
          .open(alert, {
            msg
          })
          .then(d => {
            this.filterList()
          })
      })
    },
    infiniteHandler($state) {
      this.loadData().then(
        r => {
          $state.loaded()
        },
        e => {
          $state.complete()
        }
      )
    },
    loadData(ev) {
      return new Promise((resolve, reject) => {
        this.req2svr
          .getAppApprMngOverTimePList({
            EXCEL_FILE_NAME: '',
            EXCEL_TITLE: '',
            EXCEL_HEADER: '',
            SEARCH_APPL_CD: '100003',
            APPR_CLS: 'P',
            SEARCH_PERSON_ID: '',
            SEARCH_EMP_NO: '',
            SEARCH_EMP_NM: '',
            SEARCH_TRG_PERSON_ID: this.SEARCH_TRG_PERSON_ID,
            SEARCH_TRG_EMP_NO: this.SEARCH_TRG_EMP_NO,
            SEARCH_TRG_EMP_NM: this.SEARCH_TRG_EMP_NM,
            SEARCH_APPL_CHK: this.SEARCH_APPL_CHK,
            SEARCH_STA_YMD: this.SEARCH_STA_DATE,
            SEARCH_END_YMD: this.SEARCH_END_DATE,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              // console.log(r)
              if (r.data && r.data.length > 0) {
                this.list = r.data
                _.forEach(this.list, (v, i) => {
                  v.FORMATTED_REQ_YMD = moment(v.REQ_YMD).format('YYYY.MM.DD')
                  v.isShowDetail = false
                })
                this.list = _.concat(this.dataList, this.list)
                this.dataList = this.list
                resolve(r)
              } else {
                reject(r)
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
    },
    showDetail($ev, key, item) {
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key
      // 상세페이지 열때, 읽은 여부 상태값 저장 필요...
      // 미승인 상태의 목록을 펼처 보았을때만, 카운트하여 좌측메뉴에 표시
      let exceptArr = ['결재요청', '결재중', '승인중']
      if (exceptArr.some(e => e === item.APPL_STAT_NM)) {
        this.$store.dispatch('setStorageCnt', {
          item,
          storegeKey: 'last_time_mng_over'
        })
      }
      this.$nextTick(() => {
        $($ev.target.offsetParent.offsetParent)
          .closest('.scroll_cont')
          .animate({ scrollTop: $ev.target.offsetParent.offsetParent.offsetTop }, 500)
        if (this.selectedId === -1) return // 디테일 페이지 접을땐 통신 않함
        this.req2svr
          .reqOverTimeApp({
            EDIT_FLAG: 'N',
            REQ_NO: item.REQ_NO
          })
          .then(r => {
            // console.log(r)
            this.detailData = r

            this.minMinutes = r.minMinutes
            // var quarterHours = ['00', '30']
            for (var i = 0; i < 24; i++) {
              for (var j = 0; j < r.intervals.length; j++) {
                this.times.push(('0' + i).slice(-2) + ':' + r.intervals[j])
              }
            }
          })
      })
    },
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDate() {
      let sd = moment(this.SEARCH_STA_DATE)
      let ed = moment(this.SEARCH_END_DATE)
      if (ed.diff(sd, 'days') < 0) {
        this.SEARCH_END_DATE = this.SEARCH_STA_DATE
      }
      this.filterList()
    },
    filterList(...args) {
      // console.log(args)
      this.spin = true
      this.list = []
      this.dataList = []
      this.selectedId = -1
      this.$el.querySelector('.scroll_cont').scrollTop = 0

      this.$nextTick(() => {
        // console.log(this.$refs.infiniteLoading)
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      })
    },
    showBtn() {
      this.popup
        .open(popupMenu, {
          pageName: this.$options.name
        })
        .then(r => {
          if (r.btn.value === 'open') {
            setTimeout(() => {
              this.$emit('closePop', true)
            }, 800)
          }
        })
    }
  },
  templateSrc: './confirmList.html'
}
