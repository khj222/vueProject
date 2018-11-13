import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import eduRequest from '../eduRequest/eduRequest'
import eduServPart from '~/edu/eduServList/detail/detail'

export default {
  name: 'eduMyTuteList',
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
      SEARCH_END_YYYY: moment().format('YYYY')
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
    openDetail($event, key, item) {
      let props = { COSE_ID: item.COSE_ID, COSE_OPEN_ID: item.COSE_OPEN_ID, formTute: true }
      this.popup.open(eduRequest, props, this)
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
    openServ(item) {
      let props = { coseServData: item }
      this.popup.open(eduServPart, props, this)
    }
  },
  templateSrc: './eduMyTuteList.html'
}
