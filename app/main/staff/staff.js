import moment from 'moment'
import alert from '~/popup/alert/alert'
import 'swiper/dist/css/swiper.css'
import constant from '@constant'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import _ from 'lodash'
import login from '~/popup/login/login'

let noticeView, startDistance, moveDistance, curY

export default {
  name: 'staff',
  props: [],
  inject: ['req2svr', 'popup', 'push', 'alert'],
  data() {
    return {
      survList: [],
      mainBus: new Vue(),
      quickmenuswiperOption: {
        allowTouchMove: true, // 메뉴 생기기전까지 임시로 막아둠
        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 30,
        mousewheel: true,
        pagination: {
          el: '.main_tab',
          clickable: true,
          renderBullet(index, className) {
            return `<span class="${className} swiper-pagination-bullet" style="width:${
              100 / Object.keys(Vue.store.state.ROLE.menu).length >= 50
                ? '33.3'
                : 100 / Object.keys(Vue.store.state.ROLE.menu).length
            }%">${Object.keys(Vue.store.state.ROLE.menu)[index]}</span>`
          }
        }
      },
      swiperOption: {
        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 30,
        mousewheel: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        }
      },
      imgSrc: '',
      alarmCnt: 0,
      isCheckingCnt: false,
      isOpenMenu: false,
      userBasicInfo: {},
      today: moment(),
      todayStatus: {},
      isCoachMark: true,
      setSkipCoachMark: false,
      pushData: {},
      isOpenMenuFirst: true,
      compSurveyList: []
    }
  },
  created() {},
  resume() {
    // this.setAlarmCnt()
  },
  screenshot() {
    let msg =
      '보안정책에 따라 화면캡처를 하실 수 없습니다.\n화면캡쳐시 로그가 서버에 전송되므로 반드시 삭제하셔야 합니다.'
    this.popup
      .open(alert, {
        msg
      })
      .then(r => {})
  },
  beforeMount() {},
  mounted() {
    this.mainBus.$on('updateSurveyList', () => {
      this.getSurvList()
    })
    this.$store.state.eventBus.$on('updateSurveyList', () => {
      this.getSurvList()
    })
    let d = window.localStorage.getItem('isCoachMark')
      ? window.localStorage.getItem('isCoachMark') === 'true'
      : true
    this.isCoachMark = d
    // console.log(this.isCoachMark)
    setTimeout(() => {
      // this.push.onNotification(this, this.setAlarmCnt)
      this.req2svr
        .getBasicInfoImg({
          PERSON_ID: this.$store.state.PERSON_ID,
          MAIN_EMP_NO: this.$store.state.EMP_NO,
          MAIN_EMP_NM: this.$store.state.EMP_NM,
          SEARCH_RETIRE_YN: '',
          SEARCH_RETIRE: '30',
          SEARCH_ORG_CD: '',
          I_SRCH_AUTH: '10',
          SEARCH_DUTY: '',
          SEARCH_NM: this.$store.state.EMP_NO,
          VIEW_EMP_NO: this.$store.state.EMP_NO + ' / ' + this.$store.state.EMP_NM
        })
        .then(r => {
          if (r.result && r.result.src) {
            this.imgSrc = r.result.src
          }
        })
      this.req2svr
        .getBasicInfoDetail({
          PERSON_ID: this.$store.state.PERSON_ID,
          MAIN_EMP_NO: this.$store.state.EMP_NO,
          MAIN_EMP_NM: '',
          SEARCH_RETIRE_YN: '',
          SEARCH_RETIRE: '30',
          SEARCH_ORG_CD: '',
          I_SRCH_AUTH: '40',
          SEARCH_DUTY: '',
          VIEW_EMP_NO: ''
        })
        .then(r => {
          if (r.result) {
            this.userBasicInfo = r.result
            this.$store.commit('userBasicInfo[set]', this.userBasicInfo)
            this.$store.commit('EMP_NM[set]', this.userBasicInfo.EMP_NM)
          }
          // console.log(r)
        })
      this.req2svr
        .getEmpWorkHoliTamDay({
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          YYYYMM: this.today.format('YYYYMM'),
          YYYY: this.today.format('YYYY'),
          MM: this.today.format('M'),
          CNT: ''
        })
        .then(r => {
          if (r.status === 'ok') {
            this.todayStatus = _.filter(r.resultList, o => {
              // console.log(this.today.format('YYYYMMDD'))
              return o.YMD === this.today.format('YYYYMMDD')
            })
          }
          // console.log(this.todayStatus)
        })
      if (constant.baseURL === 'https://mhrdev.homenservice.com') {
        this.getSurvList()
      }

      noticeView = this.$el.querySelector('.notice_view')
    }, 0)
  },
  destroyed() {
    // this.push.offNotification(this, this.setAlarmCnt)
  },
  computed: {
    quickmenuSwiper() {
      return this.$refs.quickmenuSwiper.swiper
    },
    swiper() {
      return this.$refs.mySwiper.swiper
    },
    getToday() {
      return this.today.format('YYYY.MM.DD')
    }
  },
  methods: {
    loginPopup() {
      this.popup.open(login, null, null, {
        ignoreSkipOpen: true
      })
    },
    orderMenu(obj) {
      return _.orderBy(
        obj,
        [
          o => {
            return o.mainWeight || ''
          }
        ],
        ['desc']
      ).slice(0, 6)
    },
    getSurvList() {
      this.$store.dispatch('getSurveyList').then(r => {
        this.compSurveyList = this.$store.getters.getCompSurveyList
        let a = _.filter(r, v => {
          return !this.isCompleted(this.compSurveyList, v)
        })
        this.survList = a
      })
    },
    isCompleted(c, item) {
      return item && item.URL && _.includes(c, item.URL)
    },
    openInAppBrowser(item) {
      this.compSurveyList = this.$store.getters.getCompSurveyList
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
          this.getSurvList()
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
      // survey.methods.openInAppBrowser(item)
    },
    formatSurvDate(d) {
      return moment(d).format('MM.DD')
    },
    getPushData() {
      return Object.keys(this.$store.state.recentPush).length > 0
    },
    closeCoachMark(e) {
      this.isCoachMark = false
      // this.$cookie.set('isCoachMark', !this.setSkipCoachMark, {
      //   expires: '1Y'
      // })
      window.localStorage.setItem('isCoachMark', !this.setSkipCoachMark)
      // window.localStorage.setItem('isCoachMark', !this.setSkipCoachMark)
    },
    onPanStart(e) {
      $(noticeView).removeClass('up down')
      var matrix = $(noticeView)
        .css('transform')
        .replace(/[^0-9\-.,]/g, '')
        .split(',')
      var y = matrix[13] || matrix[5]
      // console.log(matrix, y)
      startDistance = y
    },
    onPanMove(e) {
      // console.log(e)
      moveDistance = e.distance
      // console.log(curY)
      if (e.additionalEvent === 'panup') {
        curY = (moveDistance - startDistance) * -1
        if (curY < 1) curY = 0
        if (curY < window.outerHeight / 1.2) $(noticeView).addClass('up')
      } else if (e.additionalEvent === 'pandown') {
        curY = moveDistance - startDistance
        if (curY > 478 || curY < 1) curY = 479.96
        if (curY > 20) $(noticeView).addClass('down')
      }
      $(noticeView).css({
        transform: 'translate3d(0,' + curY + 'px, 0)'
      })
    },
    onPanEnd(e) {
      if ($(noticeView).hasClass('up') === true) {
        $(noticeView)
          .css({
            transform: 'translate3d(0,0,0)'
          })
          .removeClass('up')
      } else if ($(noticeView).hasClass('down') === true) {
        $(noticeView)
          .css({
            transform: 'translate3d(0, 84.5vh, 0)'
          })
          .removeClass('down')
      }
    },
    openMenu() {
      this.isOpenMenu = true
      if (this.isOpenMenuFirst) {
        setTimeout(() => {
          this.setAlarmCnt()
          this.isOpenMenuFirst = false
        }, 0)
      }
    },
    open(name, props) {
      if (!props || props === null) {
        props = { mainBus: this.mainBus }
      }
      this.popup.open(this.$store.state.child[name], props, this, {
        beforeAnchor: true
      })
      setTimeout(() => {
        this.isOpenMenu = false
      }, 800)
    },
    setAlarmCnt() {
      this.$store.dispatch('getAppApprMngOverTimePListCnt')
      // this.$store.dispatch('getAppApprMngListCnt')
      this.$store.dispatch('getPushListCnt')
      this.$store.dispatch('getAppApprMngPListCnt')
      this.$store.dispatch('getEduTuteApprPListCnt')
    },
    checkMenu(cate, id) {
      // let k = this.$store.state.EMP_NO.substr(0, 1)
      // if (k === 'P') return false
      let result = false
      _.forEach(this.$store.state.ROLE.menu[cate], (v, i) => {
        if (id === v.id) {
          result = true
          return false
        }
      })
      return result
    },
    checkNew(id) {
      // let k = this.$store.state.EMP_NO.substr(0, 1)
      // if (k === 'P') return false
      let result = false
      _.forEach(this.$store.state.ROLE.new, (v, i) => {
        if (id === v.id) {
          result = true
          return false
        }
      })
      return result
    }
  },
  components: {
    swiper,
    swiperSlide
  },
  templateSrc: './staff.html'
}
