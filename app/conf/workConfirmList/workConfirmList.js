import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import alert from '~/popup/alert/alert'
import search from '~/conf/confirmList/search/search'
import popupMenu from '~/popup/menu/menu'
import Vue from 'vue'

export default {
  name: 'workConfirmList',
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
      totBalanceCnt: 0,
      remainingDaysAnnual: null,
      remainingDaysSpecial: null,
      list: [],
      dataList: [],
      STA_YMD: moment().format('YYYY-MM-DD'),
      END_YMD: moment().format('YYYY-MM-DD'),
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
      isChange: false,
      TAM_CD: '',
      TAM_CODE_LIST: [],
      selectedTam: {}
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr.getCommonCodeIdxDtlList({ CD_IDX: 'TAM_CODE', pageIndex: 1 }).then(r => {
        this.TAM_CODE_LIST = r
      })
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
    isConfirmed(item) {
      // 900: 승인, 990: 반려
      return (
        item.APPL_STAT_NM === '승인완료' ||
        item.APPL_STAT_NM === '승인' ||
        item.APPL_STAT_NM === '반려'
      )
    },
    checkChange() {
      this.isChange = true
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
    applyWork(item) {
      let msg
      let isValid = true

      this.selectedTam = _.filter(this.TAM_CODE_LIST, o => {
        return o.value === this.detailData.resultInfoList[0].TAM_CD
      })
      this.TAM_CD = this.selectedTam.value
      this.STA_YMD = this.detailData.resultInfoList[0].STA_YMD
      this.END_YMD = this.detailData.resultInfoList[0].END_YMD

      let Frm = []
      let FrmData = {
        APPL_CD: '100004',
        YYYY: moment(this.STA_YMD).format('YYYY'),
        APPR_EMP_NO1: '',
        APPR_EMP_NO2: '',
        APPR_EMP_NO3: '',
        APPR_CLS1: '',
        APPR_CLS2: '',
        APPR_CLS3: '',
        TRG_PERSON_ID: this.detailData.TRG_PERSON_ID,
        TRG_EMP_NO: this.detailData.TRG_EMP_NO,
        TRG_EMP_NM: this.detailData.TRG_EMP_NM,
        TAM_CD: this.detailData.resultInfoList.TAM_CD
          ? this.detailData.resultInfoList.TAM_CD + ''
          : '',
        REQ_NO: item.REQ_NO + '',
        ACCM_BLN_DCNT: '',
        ACT_DCNT: '0',
        REASON_CHK: 'Y',
        CRT_DCNT63: '0',
        USE_DCNT63: '0',
        BLN_DCNT63: '0',
        CRT_DCNT51: '0',
        USE_DCNT51: '0',
        BLN_DCNT51: '0',
        REASON: this.detailData.REASON + ''
      }
      if (this.remainingDaysAnnual) {
        FrmData.CRT_DCNT63 = this.remainingDaysAnnual.CRT_DCNT
          ? this.remainingDaysAnnual.CRT_DCNT + ''
          : '0'
        FrmData.USE_DCNT63 = this.remainingDaysAnnual.USE_DCNT
          ? this.remainingDaysAnnual.USE_DCNT + ''
          : '0'
        FrmData.BLN_DCNT63 = this.remainingDaysAnnual.BLN_DCNT
          ? this.remainingDaysAnnual.BLN_DCNT + ''
          : '0'
      }
      if (this.remainingDaysSpecial) {
        FrmData.CRT_DCNT51 = this.remainingDaysSpecial.CRT_DCNT
          ? this.remainingDaysSpecial.CRT_DCNT + ''
          : '0'
        FrmData.USE_DCNT51 = this.remainingDaysSpecial.USE_DCNT
          ? this.remainingDaysSpecial.USE_DCNT + ''
          : '0'
        FrmData.BLN_DCNT51 = this.remainingDaysSpecial.BLN_DCNT
          ? this.remainingDaysSpecial.BLN_DCNT + ''
          : '0'
      }

      Frm.push(FrmData)
      let staYmd = moment(this.STA_YMD)
      let endYmd = moment(this.END_YMD)
      let diffDays = endYmd.diff(staYmd, 'days')
      let dayCheck = []
      let List = []
      // console.log(diffDays)
      _.forEach(this.detailData.resultInfoList, (v, k) => {
        let staYmd2 = moment(v.STA_YMD)
        let endYmd2 = moment(v.END_YMD)
        let diffDays2 = endYmd2.diff(staYmd2, 'days')

        let startDay = staYmd2
        for (let i = 0; i <= diffDays2; i++) {
          let daysArr = {
            STA_YMD: startDay.format('YYYYMMDD'),
            END_YMD: startDay.format('YYYYMMDD'),
            WORK_TAM_CD: v.TAM_CD
          }
          dayCheck[i] = this.req2svr
            .getWorkHoliDayView({
              APPL_CD: '100003',
              PERSON_ID: this.detailData.TRG_PERSON_ID,
              EMP_NO: this.detailData.TRG_EMP_NO,
              DATE_CHK: startDay.format('YYYYMMDD')
            })
            .then(r => {
              if (
                r.status === 'ok' &&
                ((this.selectedTam.type === 'plainOnly' && r.result.DAY_NM === '평일') ||
                  (this.selectedTam.type === 'holidayOnly' && r.result.DAY_NM === '휴일') ||
                  (this.selectedTam.type !== 'plainOnly' &&
                    this.selectedTam.type !== 'holidayOnly'))
              ) {
                List.push(daysArr)
              }
            })
          startDay.add(1, 'days')
        }
      })

      Promise.all(dayCheck).then(r => {
        // 근태구분에서 연차 선택했을경우 (연차 코드 = 63)
        if (
          this.selectedTam.value === '63' &&
          List.length > (this.remainingDaysAnnual.BLN_DCNT || 0)
        ) {
          msg = '연차 잔여 수가 부족합니다.'
          isValid = false
          // 근태구분에서 특휴 선택했을경우 (특휴 코드 = 51)
        } else if (
          this.selectedTam.value === '51' &&
          List.length > (this.remainingDaysSpecial.BLN_DCNT || 0)
        ) {
          msg = '특휴 잔여 수가 부족합니다.'
          isValid = false
        }
        let sendingData = {
          Frm: Frm,
          List: List
        }
        if (List.length === 0) {
          if (this.selectedTam.type === 'plainOnly') {
            msg = '휴일 신청은 불가합니다.'
            isValid = false
          } else if (this.selectedTam.type === 'holidayOnly') {
            msg = '평일 신청은 불가합니다.'
            isValid = false
          }
        } else if (diffDays > 0 && List.length !== diffDays + 1) {
          // 목록의 개수와 날짜의 차이 개수가 다를때...
          // 단 이때는 두가지 상황이 있음, 한 날짜만 선택했을땐

          if (this.selectedTam.type === 'plainOnly') {
            msg = `선택하신 기간 중 휴일을 제외한 ${List.length}일의 신청서가 제출됩니다.`
          } else if (this.selectedTam.type === 'holidayOnly') {
            msg = `선택하신 기간 중 평일을 제외한 ${List.length}일의 신청서가 제출됩니다.`
          }
          return this.popup
            .open(alert, {
              msg,
              btnList: [
                {
                  text: '아니오',
                  value: false
                },
                {
                  text: '네',
                  value: true
                }
              ]
            })
            .then(rxx => {
              if (rxx.btn.value) {
                this.requestApply(sendingData, item)
              }
            })
        }
        if (!isValid) {
          return this.popup.open(alert, {
            msg
          })
        }

        this.requestApply(sendingData, item)
      })
    },
    requestApply(sendingData, item) {
      let msg
      this.req2svr.execWorkHoliAppChk(sendingData).then(r => {
        msg = null
        if (r.result === 'OK') {
          this.req2svr.insertWorkHoliApp(sendingData).then(rx => {
            msg = rx.result
            if (rx.status === 'ok') {
              // 근태 승인
              this.approve(item)
            } else {
              this.popup.open(alert, {
                msg
              })
            }
          })
        } else {
          msg = r.msg
          this.popup.open(alert, {
            msg
          })
        }
      })
    },
    approve(item) {
      let msg
      let data
      let res = {
        REQ_NO: item.REQ_NO + '',
        APPL_CD: '100004',
        TRG_EMP_NO: item.TRG_EMP_NO
      }
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
    },
    reject(item) {
      let res = {
        REQ_NO: item.REQ_NO + '',
        APPL_CD: '100004',
        TRG_EMP_NO: item.TRG_EMP_NO
      }

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
      // console.log('loadmore')
      this.loadData().then(
        r => {
          $state.loaded()
        },
        e => {
          $state.complete()
        }
      )
    },
    focusScroll(ev) {
      let scrollCont = this.$el.querySelector('.scroll_cont')
      if (scrollCont.scrollTop !== ev.target.offsetParent.offsetTop) {
        setTimeout(() => {
          scrollCont.scrollTop = ev.target.offsetParent.offsetTop
        }, 500)
      }
    },
    loadData(ev) {
      // console.log($state)
      let formData = {
        EXCEL_FILE_NAME: '',
        EXCEL_TITLE: '',
        EXCEL_HEADER: '',
        SEARCH_APPL_CD: '', // 근태신청 목록 : 100004 만
        APPR_CLS: 'P',
        SEARCH_ORG_CD: '',
        I_SRCH_AUTH: '',
        SEARCH_PERSON_ID: this.SEARCH_TRG_PERSON_ID,
        SEARCH_EMP_NO: this.SEARCH_TRG_EMP_NO,
        SEARCH_EMP_NM: this.SEARCH_TRG_EMP_NM,
        SEARCH_STA_DATE: this.SEARCH_STA_DATE,
        SEARCH_END_DATE: this.SEARCH_END_DATE,
        SEARCH_APPL_CHK: this.SEARCH_APPL_CHK,
        pageIndex: Math.ceil(this.list.length / 10 + 1)
      }
      return new Promise((resolve, reject) => {
        this.req2svr.getAppApprMngPList(formData).then(
          r => {
            // console.log(r)
            if (r.data && r.data.length > 0) {
              this.list = r.data
              _.forEach(this.list, (v, i) => {
                v.FORMATTED_REQ_YMD = moment(v.REQ_YMD).format('YYYY.MM.DD')
                v.isShowDetail = false
                v.VAL_STA_HMS = ('0' + parseInt(v.STA_HMS)).slice(-2)
                v.VAL_END_HMS = ('0' + parseInt(v.END_HMS)).slice(-2)
              })
              this.list = _.concat(this.dataList, this.list)
              this.dataList = this.list
              resolve(r)
              // this.$nextTick(() => {
              //   this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
              // })
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
      // console.log($ev)
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key
      // 상세페이지 열때, 읽은 여부 상태값 저장 필요...
      // console.log(item)
      // 미승인 상태의 목록을 펼처 보았을때만, 카운트하여 좌측메뉴에 표시
      let exceptArr = ['결재요청', '결재중', '승인중']
      if (exceptArr.some(e => e === item.APPL_STAT_NM)) {
        this.$store.dispatch('setStorageCnt', {
          item,
          storegeKey: 'last_time_mng_plist'
        })
      }
      this.$nextTick(() => {
        $($ev.target.offsetParent.offsetParent)
          .closest('.scroll_cont')
          .animate({ scrollTop: $ev.target.offsetParent.offsetParent.offsetTop }, 500)
        if (this.selectedId === -1) return // 디테일 페이지 접을땐 통신 않함
        // 근태신청일 경우 통신
        this.req2svr
          .reqWorkHoliApp({
            EDIT_FLAG: 'N',
            REQ_NO: item.REQ_NO
          })
          .then(r => {
            // console.log(r)
            this.detailData = r
            _.forEach(r, (v, k) => {
              if (k === 'resultInfoList') {
                _.forEach(v, vv => {
                  vv.FORMATTED_STA_YMD = moment(vv.STA_YMD).format('YYYY-MM-DD')
                  vv.FORMATTED_END_YMD = moment(vv.END_YMD).format('YYYY-MM-DD')
                })
              }
            })

            this.req2svr
              .getRemainingDays({
                APPL_CD: '',
                YYYY: moment().format('YYYY'),
                APPR_EMP_NO1: '',
                APPR_EMP_NO2: '',
                APPR_EMP_NO3: '',
                APPR_CLS1: '',
                APPR_CLS2: '',
                APPR_CLS3: '',
                TRG_PERSON_ID: r.TRG_PERSON_ID,
                TRG_EMP_NO: r.TRG_EMP_NO,
                TRG_EMP_NM: r.TRG_EMP_NM,
                TAM_CD: '',
                ACCM_BLN_DCNT: '',
                ACT_DCNT: '0',
                REASON: '',
                REASON_CHK: 'Y',
                CRT_DCNT63: '0',
                USE_DCNT63: '0',
                BLN_DCNT63: '0',
                CRT_DCNT51: '0',
                USE_DCNT51: '0',
                BLN_DCNT51: '0'
              })
              .then(rr => {
                if (rr.result.length > 0) {
                  _.forEach(rr.result, o => {
                    if (o.TAM_CD === '63') {
                      // 연차
                      this.remainingDaysAnnual = o
                    } else if (o.TAM_CD === '51') {
                      // 특휴
                      this.remainingDaysSpecial = o
                    }
                    this.totBalanceCnt += parseInt(o.BLN_DCNT, 10)
                  })
                }
                // console.log(r, r.result.length)
              })
          })
      })
    },
    formatDate(d) {
      if (moment(d).isValid()) return moment(d).format('YYYY.MM.DD')
      return '-'
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
  templateSrc: './workConfirmList.html'
}
