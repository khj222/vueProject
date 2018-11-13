import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'noticeList',
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
      spin: true
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
    }, 0)
  },
  beforeTransitionLeave() {},

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
          .pushList({
            pageSize: 10,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              // console.log(r)
              if (r.data && r.data.length > 0) {
                this.list = r.data
                _.forEach(this.list, (v, i) => {
                  // console.log(i)
                  // \n 인덱스 구한수 슬라이스 하여 분리
                  let idx = v.CONTENTS.indexOf('\n')
                  v.title = v.CONTENTS.slice(0, idx)
                  v.content = v.CONTENTS.slice(idx + 1)
                  v.isShowDetail = false
                })
                this.list = _.concat(this.dataList, this.list)
                this.dataList = this.list
                // console.log(this.dataList)
                resolve(r)
              } else {
                reject(r)
              }
              this.spin = false
            },
            () => {
              this.spin = false
            }
          )
      })
    },
    showDetail($ev, key, item) {
      // console.log($ev)
      if (this.selectedId === key) this.selectedId = -1
      else this.selectedId = key
      this.$store.dispatch('setStorageCnt', {
        item,
        storegeKey: 'last_time_push'
      })
      setTimeout(e => {
        $($ev.target.offsetParent.offsetParent)
          .closest('.scroll_cont')
          .animate(
            {
              scrollTop: $ev.target.offsetParent.offsetParent.offsetTop
            },
            500
          )
      }, 0)
    }
  },
  templateSrc: './noticeList.html'
}
