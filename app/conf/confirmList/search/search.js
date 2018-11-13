import req2svr from '../req2svr'
// import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
// import alert from '~/popup/alert/alert'

export default {
  name: 'searchMember',
  inject: ['popup'],
  props: ['bus'],
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
      selectedId: -1,
      spin: true,
      ORG_CD_NM: null,
      SEARCH_USER_NM: '',
      SEARCH_DUTY: '',
      PAS_DUTY_LIST: []
    }
  },
  afterEnter() {
    this.$nextTick(() => {
      this.req2svr
        .getCommonCodeIdxDtlList({ CD_IDX: 'PAS_DUTY', pageIndex: 1 })
        .then(r => {
          this.PAS_DUTY_LIST = r
        })
      this.loadData()
    })
  },
  beforeTransitionLeave() {},

  methods: {
    infiniteHandler($state) {
      // console.log('sss')
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
          .getUserListPop({
            SEARCH_ORG_CD: this.$store.state.ORG_CD,
            SEARCH_EMP_CLS: '',
            I_SRCH_AUTH: '30',
            SEARCH_USER_NM: this.SEARCH_USER_NM,
            SEARCH_DUTY: this.SEARCH_DUTY,
            SEARCH_RETIRE: '',
            SEARCH_WORK_STAT: '',
            SEARCH_ORG_NM: '',
            pageIndex: Math.ceil(this.list.length / 10 + 1)
          })
          .then(
            r => {
              //   console.log(r)
              if (r.data && r.data.length > 0) {
                this.list = r.data
                this.ORG_CD_NM = this.list[0].ORG_CD_NM
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
    search(...args) {
      // console.log(args)
      this.spin = true
      this.list = []
      this.dataList = []
      this.selectedId = -1

      setTimeout(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      })
    },
    selectMember(item) {
      this.bus.$emit('setMember', item)
      this.$emit('closePop', true)
    }
  },
  templateSrc: './search.html'
}
