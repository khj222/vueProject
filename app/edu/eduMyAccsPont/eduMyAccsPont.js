import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'eduMyAccsPont',
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
      isScroll: false,
      list: [],
      dataList: [],
      curYear: moment()
        .add('year', 1)
        .format('YYYY'),
      SEARCH_YYYY: moment().format('YYYY'),
      spin: true,
      yearList: []
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
    loadData(ev) {
      return new Promise((resolve, reject) => {
        this.req2svr
          .getMyAccsPontList({
            I_SRCH_AUTH: '40',
            ORDER_BY_SEQ: '2',
            SEARCH_YYYY: this.SEARCH_YYYY,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              if (r.status === 'ok' && r.data && r.data.length > 0) {
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
    onYearChange() {
      this.spin = true
      this.list = []
      this.dataList = []
      this.selectedId = -1
      this.$el.querySelector('.scroll_cont').scrollTop = 0
      this.$nextTick(() => {
        this.loadData()
      })
    }
  },
  templateSrc: './eduMyAccsPont.html'
}
