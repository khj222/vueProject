import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import eduCoseOpenList from '~/edu/eduCoseOpenList/eduCoseOpenList'

export default {
  name: 'eduCoseList',
  inject: ['popup'],
  props: ['myFit'],
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
      SEARCH_EDU_MY_FIT: ''
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
    }, 0)
  },
  beforePopup(done) {
    if (this.myFit) {
      this.SEARCH_EDU_MY_FIT = this.myFit
    }
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
          .getEduCoseList({
            OPEN_YN: 'Y',
            // SEARCH_EDU_STA_DATE: this.SEARCH_STA_DATE,
            // SEARCH_EDU_END_DATE: this.SEARCH_END_DATE,
            SEARCH_COSE_NM: this.SEARCH_COSE_NM,
            SEARCH_EDU_MY_FIT: this.SEARCH_EDU_MY_FIT,
            pageIndex: Math.ceil(this.list.length / 10 + 1),
            APP_PERIOD_YN: 'Y',
            EDU_END_YN: 'N',
            TARGET_YN: 'Y'
          })
          .then(
            r => {
              if (r.data && r.data.length > 0) {
                this.list = r.data
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
      let props = { coseData: item }
      this.popup.open(eduCoseOpenList, props, this)
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
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDate() {
      let sd = moment(this.SEARCH_STA_DATE)
      let ed = moment(this.SEARCH_END_DATE)
      if (ed.diff(sd, 'days') < 0) {
        this.SEARCH_END_DATE = this.SEARCH_STA_DATE
      }
    }
  },
  templateSrc: './eduCoseList.html'
}
