import req2svr from './req2svr'
import moment from 'moment'

export default {
  name: 'survey',
  inject: ['popup'],
  props: ['fromAList', 'mainBus'],
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
      START_DT: moment()
        .startOf('month')
        .add(-1, 'month')
        .format('YYYY-MM-DD'),
      END_DT: moment()
        .endOf('month')
        .format('YYYY-MM-DD'),
      spin: true,
      TITLE: '',
      isSearch: false,
      compSurveyList: []
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.loadData()
    }, 0)
  },
  beforePopup(done) {
    return done()
  },
  methods: {
    // moment('2010-10-20').isAfter('2010-10-19'); // true
    // 참여날짜가 현재 날짜보다 지난 경우
    isEnded(d) {
      return moment().isAfter(moment(d), 'day')
    },
    isCompleted(item) {
      return _.includes(this.compSurveyList, item.URL)
    },
    formatDate(d) {
      return moment(d).format('YYYY.MM.DD')
    },
    isDeadLine(d) {
      return moment(d).isSame(moment(), 'day')
    },

    loadData() {
      return new Promise((resolve, reject) => {
        let formData = {
          START_DT: moment(this.START_DT).format('YYYYMMDD'),
          END_DT: moment(this.END_DT).format('YYYYMMDD')
        }
        if (this.TITLE !== '') {
          formData.TITLE = this.TITLE
        }
        this.req2svr.getSurveyList(formData).then(
          r => {
            this.compSurveyList = this.$store.getters.getCompSurveyList
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
    openInAppBrowser(item) {
      this.compSurveyList = this.$store.getters.getCompSurveyList
      if (_.includes(this.compSurveyList, item.URL)) {
        return false
      }
      var ref = window.cordova.InAppBrowser.open(
        encodeURI(item.URL),
        '_blank',
        'location=no,hideurlbar=yes,hidenavigationbuttons=yes,toolbar=yes,footer=no,zoom=no,hidespinner=yes'
      )
      window.SpinnerDialog.show(null, null, true)
      ref.addEventListener('loadstart', event => {
        // survey-taken 이미 설문을 참여한 경우 페이지 주소 , survey-thanks 설문을 완료한 경우 페이지 주소
        if (event.url.indexOf('survey-taken') > -1 || event.url.indexOf('survey-thanks') > -1) {
          this.compSurveyList.push(item.URL)
          this.$store.commit('compSurveyList[set]', this.compSurveyList)
          this.compSurveyList = this.$store.getters.getCompSurveyList
          this.mainBus.$emit('updateSurveyList')
          this.$forceUpdate()
        }
        if (
          event.url.indexOf('survey-taken') > -1 ||
          event.url.indexOf('survey-thanks') > -1 ||
          event.url.indexOf('ut_source') > -1 ||
          event.url.indexOf('surveyClose') > -1
        ) {
          ref.close()
          window.SpinnerDialog.hide()
        }
        // alert(event.type + ' - ' + event.url)
      })
      ref.addEventListener('loadstop', event => {
        window.SpinnerDialog.hide()
        ref.insertCSS({
          code: '.survey-footer {display:none !important;}'
        })
        ref.executeScript({
          code: "$('a[data-exit-survey-btn]').attr('href','surveyClose')"
        })
      })
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
      this.$el.querySelector('.scroll_cont').scrollTop = 0

      this.$nextTick(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      })
    },
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDate() {
      let sd = moment(this.START_DT)
      let ed = moment(this.END_DT)
      if (ed.diff(sd, 'days') < 0) {
        this.END_DT = this.START_DT
      }
    }
  },
  templateSrc: './survey.html'
}
