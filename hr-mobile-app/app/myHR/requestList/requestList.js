import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import eduRequestList from '~/edu/eduRequestList/eduRequestList'
import popupMenu from '~/popup/menu/menu'

export default {
  name: 'requestList',
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
        .add(-1, 'month')
        .format('YYYY-MM-DD'),
      SEARCH_END_DATE: moment()
        .startOf('day')
        .format('YYYY-MM-DD'),
      selectedId: -1,
      SEARCH_APPL_STAT: '',
      spin: true,
      detailData: {},
      DEFAULT_STA_HMS: '',
      DEFAULT_END_HMS: '',
      bankData: {},
      BANK_NM: '',
      isShowBtn: false
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr
        .getTamShiftInfo({
          APPL_CD: '100003',
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          DATE_CHK: ''
        })
        .then(r => {
          if (r && r.result) {
            this.DEFAULT_STA_HMS = r.result.STA_HMS
            this.DEFAULT_END_HMS = r.result.END_HMS
          }
        })
      this.loadData()
    }, 0)
  },
  mounted() {
    this.$store.dispatch('getCountList', 'REQUESTLIST')
  },

  methods: {
    formatDate(d) {
      if (moment(d).isValid()) return moment(d).format('YYYY.MM.DD')
      return '-'
    },
    checkList(cd) {
      let exceptionArr = ['100002', '100003', '100004', '100021']
      if (exceptionArr.some(e => e === cd)) {
        return true
      }
      return false
    },
    getAPPL_NM(cd) {
      let a
      if (cd === '100003') a = '초과'
      // '초과\n근무'
      else if (cd === '100004') a = '근태'
      else if (cd === '100002') a = '급여'
      else if (cd === '100021') a = '시차' // '시차\n출퇴근'
      return a
    },
    infiniteHandler($state) {
      // console.log($state)
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
      // console.log($state)
      return new Promise((resolve, reject) => {
        this.req2svr
          .getAppApprMngList({
            SEARCH_APPL_CD: '',
            APPR_CLS: '',
            TO_DATE: this.SEARCH_END_DATE,
            SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
            SEARCH_EMP_NO: this.$store.state.EMP_NO,
            SEARCH_EMP_NM: this.$store.state.EMP_NM,
            SEARCH_STA_DATE: this.SEARCH_STA_DATE,
            SEARCH_END_DATE: this.SEARCH_END_DATE,
            SEARCH_APPL_STAT: this.SEARCH_APPL_STAT,
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
      // console.log($ev)
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key
      // 상세페이지 열때, 읽은 여부 상태값 저장 필요...
      // console.log(item)
      this.$store.dispatch('setStorageCnt', {
        item,
        storegeKey: 'last_time_mng'
      })
      this.$nextTick(() => {
        $($ev.target.offsetParent.offsetParent)
          .closest('.scroll_cont')
          .animate(
            {
              scrollTop: $ev.target.offsetParent.offsetParent.offsetTop
            },
            500
          )
        if (this.selectedId === -1) return // 디테일 페이지 접을땐 통신 않함
        if (item.APPL_CD === '100003') {
          // 초과근무일 경우 통신
          this.req2svr
            .reqOverTimeApp({
              EDIT_FLAG: 'N',
              REQ_NO: item.REQ_NO
            })
            .then(r => {
              // console.log(r)
              this.detailData = r
            })
        } else if (item.APPL_CD === '100004') {
          // 근태신청일 경우 통신
          this.req2svr
            .reqWorkHoliApp({
              EDIT_FLAG: 'N',
              REQ_NO: item.REQ_NO
            })
            .then(r => {
              // console.log(r)
              this.detailData = r
            })
        } else if (item.APPL_CD === '100002') {
          // 급여신청일 경우 통신
          this.req2svr
            .popPayAcntChgView({
              EDIT_FLAG: 'N',
              REQ_NO: item.REQ_NO
            })
            .then(r => {
              this.detailData = r
            })
        } else if (item.APPL_CD === '100021') {
          // 시차 출퇴근신청일 경우
          this.req2svr
            .tamShiftAppReqPop({
              EDIT_FLAG: 'N',
              REQ_NO: item.REQ_NO
            })
            .then(r => {
              this.detailData = r
            })
        }
      })
    },
    removeText(v) {
      return _.split(v, '변경전 : ')[1]
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
    },
    hideBtn() {
      this.isShowBtn = false
    },
    openEduRequestList() {
      this.popup.open(eduRequestList, {}, this.$parent, {
        beforeAnchor: true
      })
      setTimeout(() => {
        this.$emit('closePop', true)
      }, 800)
    }
  },
  templateSrc: './requestList.html'
}
