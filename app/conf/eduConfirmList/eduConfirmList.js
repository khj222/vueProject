import req2svr from './req2svr'
import moment from 'moment'
import alert from '~/popup/alert/alert'
import InfiniteLoading from 'vue-infinite-loading'
import popupMenu from '~/popup/menu/menu'
import search from '~/conf/confirmList/search/search'

export default {
  name: 'eduConfirmList',
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
      SEARCH_APP_YMD_STA_DATE: moment()
        .startOf('day')
        .add(-6, 'month')
        .format('YYYY-MM-DD'),
      SEARCH_APP_YMD_END_DATE: moment().format('YYYY-MM-DD'),
      selectedId: -1,
      spin: true,
      SEARCH_COSE_NM: '',
      isSearch: false,
      yearList: [],
      curYear: moment()
        .add('year', 1)
        .format('YYYY'),
      SEARCH_STA_YYYY: moment().format('YYYY'),
      SEARCH_END_YYYY: moment().format('YYYY'),
      coseInCoseData: {},
      fileList: [],
      SEARCH_APP_STAT_CD: '',
      SEARCH_EMP_NO: '',
      SEARCH_EMP_NM: '',
      SEARCH_PERSON_ID: '',
      bus: new Vue()
    }
  },
  mounted() {
    this.$store.dispatch('getCountList', 'CONFIRMLIST')
    this.bus.$on('setMember', x => {
      // console.log(x)
      this.SEARCH_PERSON_ID = x.PERSON_ID + ''
      this.SEARCH_EMP_NO = x.EMP_NO + ''
      this.SEARCH_EMP_NM = x.EMP_NM + ''
      this.filterList()
    })
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
    }, 0)
  },
  beforePopup(done) {
    this.yearList = _.range(1950, this.curYear)
    this.yearList = this.yearList.reverse()
    return done()
  },
  methods: {
    isConfList(item) {
      // '승인' 목록으로 필터시 500: 승인완료
      if (this.SEARCH_APP_STAT_CD === '500') {
        // 300: 승인중, 500: 승인완료, ACC: 담당자별도승인
        if (
          item.APP_STAT_CD === '300' ||
          item.APP_STAT_CD === '500' ||
          item.APP_STAT_CD === 'ACC'
        ) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    isConfirmed(item) {
      // 100: 결제요청
      return item.APP_STAT_CD !== '100'
    },
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDate() {
      let sd = moment(this.SEARCH_APP_YMD_STA_DATE)
      let ed = moment(this.SEARCH_APP_YMD_END_DATE)
      if (ed.diff(sd, 'days') < 0) {
        this.SEARCH_APP_YMD_END_DATE = this.SEARCH_APP_YMD_STA_DATE
      }
      this.filterList()
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

    loadData() {
      return new Promise((resolve, reject) => {
        this.req2svr
          .getEduTuteApprPList({
            ORDER_BY_SEQ: '2',
            APPR_MODE: 'P',
            SEARCH_APP_YMD_STA_DATE: this.SEARCH_APP_YMD_STA_DATE,
            SEARCH_APP_YMD_END_DATE: this.SEARCH_APP_YMD_END_DATE,
            SEARCH_COSE_NM: this.SEARCH_COSE_NM,
            SEARCH_EMP_NO: this.SEARCH_EMP_NO,
            SEARCH_EMP_NM: this.SEARCH_EMP_NM,
            SEARCH_PERSON_ID: this.SEARCH_PERSON_ID,
            SEARCH_DUTY_EXPL_NM: '',
            SEARCH_APP_STAT_CD: this.SEARCH_APP_STAT_CD === '500' ? '' : this.SEARCH_APP_STAT_CD,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              if (r.data && r.data.length > 0) {
                this.list = r.data
                _.forEach(this.list, (v, i) => {
                  if (v.SERV_ID !== '') {
                    //  APP_STAT_CD === '500' 승인, 100 미승인, 400 반려
                    if (v.APP_STAT_CD === '500') {
                      if (v.EDU_CLOSE_YN === 'Y') {
                        if (v.SERV_COMM_CNT === '0' && v.SERV_OPTN_CNT === '0') {
                          v.servText = '참여필요'
                        } else {
                          v.servText = '참여완료'
                        }
                      } else {
                        v.servText = '교육 종료후 참여'
                      }
                    } else {
                      v.servText = '해당없음'
                    }
                  } else {
                    v.servText = '해당없음'
                  }
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
    focusScroll(ev) {
      let scrollCont = this.$el.querySelector('.scroll_cont')
      if (scrollCont.scrollTop !== ev.target.offsetParent.offsetTop) {
        setTimeout(() => {
          scrollCont.scrollTop = ev.target.offsetParent.offsetTop
        }, 500)
      }
    },
    showDetail($event, key, item) {
      this.fileList = []
      this.coseInCoseData = {}
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key
      // 상세페이지 열때, 읽은 여부 상태값 저장 필요...
      // console.log(item)
      // 미승인 상태의 목록을 펼처 보았을때만, 카운트하여 좌측메뉴에 표시
      let exceptArr = ['결재요청']
      if (exceptArr.some(e => e === item.APP_STAT_NM)) {
        this.$store.dispatch('setStorageCnt', {
          item,
          storegeKey: 'last_time_edu_plist'
        })
      }
      this.$nextTick(() => {
        $($event.target.offsetParent.offsetParent)
          .closest('.scroll_cont')
          .animate(
            {
              scrollTop: $event.target.offsetParent.offsetParent.offsetTop
            },
            500
          )
        if (this.selectedId === -1) return // 디테일 페이지 접을땐 통신 않함
        this.req2svr
          .popEduInCoseAppl({
            TUTE_ID: item.TUTE_ID,
            COSE_ID: item.COSE_ID,
            COSE_OPEN_ID: item.COSE_OPEN_ID,
            APPR_MODE: 'P'
          })
          .then(r => {
            this.coseInCoseData = r
            if (this.coseInCoseData.FILE_NO !== '') {
              this.req2svr
                .getEduTutoFileList({
                  COSE_ID: this.COSE_ID + '',
                  FILE_NO: this.coseInCoseData.FILE_NO + ''
                })
                .then(r => {
                  if (r.fileList && r.fileList.length > 0) {
                    this.fileList = r.fileList
                  }
                })
            }
          })
      })

      // let props = { coseData: item, coseOpendata: this.coseOpendata, formTute: true }
      // this.popup.open(eduRequest, props, this)
    },
    saveEduApplApproval(item, data) {
      let param = {
        COSE_ID: item.COSE_ID + '',
        COSE_OPEN_ID: item.COSE_OPEN_ID + '',
        AUTO_APP_YN: this.coseInCoseData.AUTO_APP_YN,
        TUTE_ID: item.TUTE_ID + '',
        APPR_ID: this.coseInCoseData.APPR_ID,
        APPR_P_EMP_NO: item.APPR_P_EMP_NO + '',
        REJ_NOTE: ''
      }
      this.req2svr.saveEduApplApproval(param).then(r => {
        let msg = r.result
        this.popup
          .open(alert, {
            msg
          })
          .then(() => {
            this.filterList()
          })
      })
    },
    saveEduApplReturn(item, data) {
      let param = {
        COSE_ID: item.COSE_ID + '',
        COSE_OPEN_ID: item.COSE_OPEN_ID + '',
        AUTO_APP_YN: this.coseInCoseData.AUTO_APP_YN,
        TUTE_ID: item.TUTE_ID + '',
        APPR_ID: this.coseInCoseData.APPR_ID,
        APPR_P_EMP_NO: item.APPR_P_EMP_NO + '',
        REJ_NOTE: item.REJ_NOTE + ''
      }
      if (!item.REJ_NOTE) {
        return this.popup.open(alert, {
          msg: '반려사유를 입력해 주세요.'
        })
      }
      this.req2svr.saveEduApplReturn(param).then(r => {
        let msg = r.result
        this.popup
          .open(alert, {
            msg
          })
          .then(() => {
            this.filterList()
          })
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
    },

    filterList(...args) {
      this.spin = true
      this.list = []
      this.dataList = []
      this.selectedId = -1
      this.$el.querySelector('.scroll_cont').scrollTop = 0

      setTimeout(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      }, 0)
    }
  },
  templateSrc: './eduConfirmList.html'
}
