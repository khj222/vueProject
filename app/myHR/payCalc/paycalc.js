import req2svr from './req2svr'
import changeAccount from '~/myHR/changeAccount/changeAccount'
import moment from 'moment'
import monthList from './monthList/monthList'
import Vue from 'vue'

let pScrollTop = 0

export default {
  name: 'paycalc',
  inject: ['popup'],
  props: ['throughMonthList', 'PayCalcNo'],
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
      dataList: {},
      totDAmount: 0,
      bankInfo: {},
      PayCalcNoList: {},
      curYear: moment().format('YYYY'),
      bus: new Vue()
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr
        .getPayAcntChgInfo({
          APPL_CD: '',
          FILE_NO: '',
          APPR_SEQ: '1',
          APPR_EMP_NO: '',
          APPR_CLS: '',
          REQ_EMP_NO: '',
          OLDBANK_CD: '',
          OLDACC_NO: '',
          BANK_CD: '',
          ACC_NO: ''
        })
        .then(r => {
          // console.log(r)
          this.bankInfo = r.result
        })
      this.getCurPayInfo()
    }, 0)
  },
  beforeTransitionLeave() {},

  mounted() {
    this.bus.$on('setPayCalcNo', x => {
      // console.log('setPayCalcNo', x)
      this.PayCalcNoList = x
      this.loadPcmPayPerRstInfo()
    }) // search에서 변경이 감지 되었을때 발생
  },
  methods: {
    getMonth(e) {
      return e.split(' ') ? e.split(' ')[0].replace('-', '.') : ''
    },
    getCurPayInfo() {
      return new Promise((resolve, reject) => {
        if (this.PayCalcNo) {
          this.PayCalcNoList = this.PayCalcNo
          // console.log(this.PayCalcNo)
          this.loadPcmPayPerRstInfo().then(r => {
            resolve(r)
          })
          return
        }
        this.req2svr
          .getTargetUserPayCalcNoList({
            SEARCH_YYYY: this.curYear,
            SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
            SEARCH_EMP_NO: this.$store.state.EMP_NO,
            SEARCH_EMP_NM: this.$store.state.EMP_NO + ' / ' + this.$store.state.EMP_NM,
            SEARCH_PAY_CALC_NO: '',
            SEARCH_ITEM_CLS: ''
          })
          .then(r => {
            // console.log(!r.data === false , !r.data[0] === false)
            if (!r.msg && (!r.data || !r.data[0])) {
              this.curYear--
              this.getCurPayInfo()
              reject(r)
            }
            if (this.curYear === moment().format('YYYY')) {
              this.PayCalcNoList = r.data[0]
            } else {
              // if there is no result in this year, get a last array
              this.PayCalcNoList = r.data[r.data.length]
            }

            // console.log(this.PayCalcNoList)
          })
          .then(() => {
            this.loadPcmPayPerRstInfo().then(r => {
              resolve(r)
            })
          })
      })
    },
    loadPcmPayPerRstInfo() {
      // console.log('loadPcmPayPerRstInfo', this.PayCalcNoList.CD)
      return new Promise((resolve, reject) => {
        let PAY_CALC_NO_LIST = []
        if (this.PayCalcNoList.CD.indexOf('|')) {
          PAY_CALC_NO_LIST = this.PayCalcNoList.CD.split('|')
        }
        this.req2svr
          .getPcmPayPerRstInfo({
            SEARCH_YYYY: this.curYear,
            SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
            SEARCH_EMP_NO: this.$store.state.EMP_NO,
            SEARCH_EMP_NM: this.$store.state.EMP_NO + ' / ' + this.$store.state.EMP_NM,
            SEARCH_PAY_CALC_NO: this.PayCalcNoList.CD,
            SEARCH_ITEM_CLS: '',
            PAY_CALC_NO_LIST: PAY_CALC_NO_LIST,
            SEARCH_ORG_YM: this.PayCalcNoList.ORG_YM,
            SEARCH_PAY_TYPE: this.PayCalcNoList.PAY_TYPE
          })
          .then(r => {
            this.dataList = r.data

            resolve(r)
          })
      })
    },
    filteredPayList(list, type) {
      return _.filter(list, function(o) {
        return o.ITEM_CLS === type // P:지급, D:공제
      })
    },
    handleScroll: function(event) {
      if (this.isScroll === true) {
        pScrollTop = 999999
        return true
      }
      var scrollGap = event.target.scrollTop - pScrollTop
      // console.log(scrollGap, container.scrollTop, pScrollTop)
      if (scrollGap > 0) {
        // 스크롤 내려갈때..
        this.isScroll = true
        // this.$forceUpdate()
        pScrollTop = 999999
      } else {
        pScrollTop = event.target.scrollTop
      }
    },
    restorePaybox: function() {
      this.isScroll = false
    },
    openChangeAccout() {
      this.popup.open(changeAccount, {}, this)
    },
    openMonthList() {
      this.popup.open(
        monthList,
        {
          throughPaycalc: true,
          bus: this.bus
        },
        this
      )
    }
  },
  templateSrc: './paycalc.html'
}
