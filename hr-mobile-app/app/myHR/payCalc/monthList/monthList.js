import req2svr from '../req2svr'
import payCalc from '~/myHR/payCalc/payCalc'
import moment from 'moment'

export default {
  name: 'monthList',
  inject: ['popup'],
  props: ['throughPaycalc', 'bus'],
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
      yearList: [],
      curYear: moment()
        .add('year', 1)
        .format('YYYY'),
      SEARCH_YYYY: moment().format('YYYY'),
      spin: true,
      SELECTED_CD: null
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.getTargetUserPayCalcNoList()
    }, 0)
  },
  beforeTransitionLeave() {},
  beforePopup(done) {
    this.yearList = _.range(1950, this.curYear)
    this.yearList = this.yearList.reverse()
    return done()
  },
  methods: {
    getTargetUserPayCalcNoList() {
      this.req2svr
        .getTargetUserPayCalcNoList({
          SEARCH_YYYY: this.SEARCH_YYYY,
          SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
          SEARCH_EMP_NO: this.$store.state.EMP_NO,
          SEARCH_EMP_NM: this.$store.state.EMP_NO + ' / ' + this.$store.state.EMP_NM,
          SEARCH_PAY_CALC_NO: '',
          SEARCH_ITEM_CLS: ''
        })
        .then(
          r => {
            this.list = r.data
            this.PayCalcNoList = this.list

            _.forEach(this.PayCalcNoList, o => {
              let PAY_CALC_NO_LIST = []
              if (o.CD.indexOf('|')) {
                PAY_CALC_NO_LIST = o.CD.split('|')
              }
              this.req2svr
                .getPcmPayPerRstInfo({
                  SEARCH_YYYY: o.ORG_YM.substr(0, 4),
                  SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
                  SEARCH_EMP_NO: this.$store.state.EMP_NO,
                  SEARCH_EMP_NM: this.$store.state.EMP_NO + ' / ' + this.$store.state.EMP_NM,
                  SEARCH_PAY_CALC_NO: o.CD,
                  SEARCH_ITEM_CLS: '',
                  PAY_CALC_NO_LIST: PAY_CALC_NO_LIST,
                  SEARCH_ORG_YM: o.ORG_YM,
                  SEARCH_PAY_TYPE: o.PAY_TYPE
                })
                .then(rr => {
                  if (rr.data) {
                    o.REAL_AMT = rr.data.pcmPayPer.REAL_AMT
                    this.$forceUpdate()
                  }
                })
            })
            this.spin = false
          },
          () => {
            this.spin = false
          }
        )
    },
    openPayDetail(item) {
      if (!item) {
        item = {}
        item = this.SELECTED_CD
      }
      if (this.throughPaycalc) {
        this.bus.$emit('setPayCalcNo', item)
        this.$emit('closePop', true)
      } else {
        this.popup.open(
          payCalc,
          {
            throughMonthList: true,
            PayCalcNo: item
          },
          this
        )
      }
    },
    onYearChange() {
      this.getTargetUserPayCalcNoList()
    },
    openPayCalc() {
      this.popup.open(
        payCalc,
        {
          throughMonthList: true
        },
        this
      )
    }
  },
  templateSrc: './monthList.html'
}
