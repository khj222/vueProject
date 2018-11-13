import req2svr from './req2svr'
import moment from 'moment'
import eduServList from '~/edu/eduServList/eduServList'
import eduRequestList from '~/edu/eduRequestList/eduRequestList'
import eduMyAccsPont from '~/edu/eduMyAccsPont/eduMyAccsPont'
import eduCoseList from '~/edu/eduCoseList/eduCoseList'
import VueCircle from 'vue2-circle-progress'
import eduRequest from '../eduRequest/eduRequest'

export default {
  components: {
    VueCircle
  },
  name: 'eduDashBoard',
  inject: ['popup'],
  data() {
    return {
      fill: { color: '#ffffff' },
      dashBoardData: {},
      list: []
    }
  },
  afterEnter() {
    setTimeout(() => {
      let data = {
        baseMenuNo: '5000000',
        menuNo: '5050100',
        buttonRRole: 'Y',
        buttonWRole: 'Y',
        buttonPRole: 'Y',
        srchauth: '40',
        upperMenuId: '5050000'
      }

      this.req2svr.getEduDashBoard(data).then(r => {
        this.dashBoardData = r
        this.updateProgress()
      })
      this.req2svr
        .getMyEduTuteList({
          SEARCH_STA_YYYY: moment().format('YYYY'),
          SEARCH_END_YYYY: moment().format('YYYY'),
          SEARCH_COSE_NM: '',
          pageIndex: 1
        })
        .then(r => {
          if (r.data.length > 0) {
            this.list = _.filter(r.data, o => {
              return o.APP_STAT_CD === '500' && o.FIN_YN === null
            })
            _.forEach(this.list, (v, i) => {
              let std = moment(v.EDU_STA_DATE)
              let today = moment()
              v.appointed = today.isBefore(std)
            })
          }
        })
    }, 0)
  },
  methods: {
    updateProgress() {
      let num = (this.dashBoardData.GAINED_MARKS / this.dashBoardData.REQUIRED_MARKS) * 100
      this.$refs.circle.updateProgress(num)
    },
    openEduCoseList(myFit) {
      let props = { myFit: myFit }
      this.popup.open(eduCoseList, props, this)
    },
    openEduRequestList() {
      this.popup.open(eduRequestList, {}, this)
    },
    openEduServList() {
      this.popup.open(eduServList, {}, this)
    },
    openEduMyAccsPont() {
      this.popup.open(eduMyAccsPont, {}, this)
    },
    openDetail(item) {
      let props = { COSE_ID: item.COSE_ID, COSE_OPEN_ID: item.COSE_OPEN_ID, formTute: true }
      this.popup.open(eduRequest, props, this)
    }
  },
  beforeTransitionLeave() {},
  computed: {
    req2svr: () => req2svr
  },
  templateSrc: './eduDashBoard.html'
}
