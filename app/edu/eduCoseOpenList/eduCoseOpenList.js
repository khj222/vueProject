import req2svr from './req2svr'
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import eduRequest from '~/edu/eduRequest/eduRequest'

export default {
  name: 'eduCoseOpenList',
  inject: ['popup'],
  props: ['coseData'],
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
      spin: true,
      SEARCH_EDU_PLAC_CD: '',
      SEARCH_EDU_AREA_CD: '',
      COSE_ID: '',
      isSearch: false,
      fileList: [],
      isShowDetail: false,
      SEARCH_EDU_PLAC: [],
      SEARCH_EDU_AREA: [],
      inCoseData: {}
    }
  },

  beforePopup(done) {
    if (this.coseData) {
      this.COSE_ID = this.coseData.COSE_ID
    }
    return done()
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
      this.req2svr
        .getEduTutoFileList({
          COSE_ID: this.coseData.COSE_ID,
          FILE_NO: this.coseData.FILE_NO
        })
        .then(r => {
          if (r.fileList && r.fileList.length > 0) {
            this.fileList = r.fileList
          }
        })
      this.req2svr.getCommonCodeIdxDtlList({ CD_IDX: 'SEARCH_EDU_PLAC', pageIndex: 1 }).then(r => {
        this.SEARCH_EDU_PLAC = r
      })
      this.req2svr.getCommonCodeIdxDtlList({ CD_IDX: 'SEARCH_EDU_AREA', pageIndex: 1 }).then(r => {
        this.SEARCH_EDU_AREA = r
      })
      this.req2svr
        .popEduInCoseOpen({
          COSE_ID: this.coseData.COSE_ID,
          COSE_OPEN_ID: null,
          TUTE_ID: null,
          I_SRCH_AUTH: '40'
        })
        .then(r => {
          this.inCoseData = r
        })
    }, 0)
  },
  methods: {
    switchDetail() {
      this.isShowDetail = !this.isShowDetail
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
          .getEduCoseOpenList({
            COSE_ID: this.COSE_ID,
            ORDER_BY: 'Y',
            OPEN_YN: 'Y',
            SEARCH_EDU_STA_DATE: this.SEARCH_STA_DATE,
            SEARCH_EDU_END_DATE: this.SEARCH_END_DATE,
            SEARCH_EDU_PLAC_CD: this.SEARCH_EDU_PLAC_CD,
            SEARCH_EDU_AREA_CD: this.SEARCH_EDU_AREA_CD,
            pageIndex: Math.ceil(this.list.length / 10 + 1)
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
      this.hideSearch()
      this.isShowDetail = false
      let props = {
        COSE_ID: item.COSE_ID,
        COSE_OPEN_ID: item.COSE_OPEN_ID
      }
      this.popup.open(eduRequest, props, this)
    },
    showSearch() {
      this.isSearch = true
    },
    hideSearch() {
      this.isSearch = false
    },
    search() {
      this.isShowDetail = false
      this.filterList()
      this.hideSearch()
    },
    onScrollStart() {
      this.hideSearch()
      this.isShowDetail = false
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
    }
  },
  templateSrc: './eduCoseOpenList.html'
}
