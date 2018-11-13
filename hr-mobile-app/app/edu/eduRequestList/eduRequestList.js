import req2svr from './req2svr'
import moment from 'moment'
import alert from '~/popup/alert/alert'
import InfiniteLoading from 'vue-infinite-loading'
import requestList from '~/myHR/requestList/requestList'
import popupMenu from '~/popup/menu/menu'

export default {
  name: 'eduRequestList',
  inject: ['popup'],
  props: ['fromAList'],
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
        .startOf('year')
        .format('YYYY-MM-DD'),
      SEARCH_END_DATE: moment()
        .endOf('year')
        .format('YYYY-MM-DD'),
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
      isShowBtn: false
    }
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
  mounted() {
    this.$store.dispatch('getCountList', 'REQUESTLIST')
  },

  methods: {
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
          .getMyEduTuteList({
            SEARCH_STA_YYYY: this.SEARCH_STA_YYYY,
            SEARCH_END_YYYY: this.SEARCH_END_YYYY,
            SEARCH_COSE_NM: this.SEARCH_COSE_NM,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              if (r.data && r.data.length > 0) {
                this.list = r.data
                _.forEach(this.list, (v, i) => {
                  if (v.SERV_ID !== '') {
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
    showDetail($event, key, item) {
      this.fileList = []
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key

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
            COSE_ID: item.COSE_ID,
            COSE_OPEN_ID: item.COSE_OPEN_ID,
            TUTE_ID: item.TUTE_ID,
            I_SRCH_AUTH: '40'
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
    saveEduCoseOpenApplCancel(item, coseInCoseData) {
      this.req2svr
        .saveEduCoseOpenApplCancel({
          COSE_ID: item.COSE_ID,
          COSE_OPEN_ID: item.COSE_OPEN_ID,
          AUTO_APP_YN: coseInCoseData.AUTO_APP_YN,
          TUTE_ID: coseInCoseData.TUTE_ID,
          APPR_ID: coseInCoseData.APPR_ID,
          APPR_P_EMP_NO: coseInCoseData.APPR_P_EMP_NO + '',
          REJ_NOTE: ''
        })
        .then(r => {
          let msg = r.result
          this.popup
            .open(alert, {
              msg
            })
            .then(() => {
              this.filterList()
              // 교육신청하기 페이지나 교육신청 바로하기 페이지에서 넘어왔을경우 해당 페이지 데이터 새로고침
              if (this.fromAList) {
                this.$parent.$options.methods.getEduInCoseData()
              }
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
    hideBtn() {
      this.isShowBtn = false
    },
    showSearch() {
      this.isSearch = true
    },
    hideSearch() {
      this.isSearch = false
    },
    search() {
      this.filterList()
      this.hideSearch()
    },
    filterList(...args) {
      this.spin = true
      this.list = []
      this.dataList = []
      this.selectedId = -1
      this.$el.querySelector('.scroll_cont').scrollTop = 0

      this.$nextTick(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      })
    },
    openRequestList() {
      this.popup.open(requestList, {}, this.$parent, {
        beforeAnchor: true
      })
      setTimeout(() => {
        this.$emit('closePop', true)
      }, 800)
    }
  },
  templateSrc: './eduRequestList.html'
}
