import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'weekCalendar',
  data() {
    return {

      today: new Date(),
      // selectedDate: new Date(),
      calFirstDate: moment().startOf('week').toDate(),
      calObj: [],
      isMondayFirst: false,
      weekDays: [],
      calPrevDate: moment().startOf('week').toDate(),
      selectedMonth: null
    }
  },
  mounted() {
    this.weekDays = _(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'])[this.isMondayFirst ? 'push' : 'unshift']('SUNDAY').value()
    this.getCurWeek(this.calFirstDate.getFullYear(), this.calFirstDate.getMonth(), this.calFirstDate.getDate(), this.isMondayFirst)
  },
  methods: {
    getCurWeek(year, month, day, isMondayFirst) {

      let weekList
      let thisMonthDays = []
      // isMondayFirst ...????? 이것때문에 주간 페이지 넘기기씨 오류중...
      isMondayFirst = (isMondayFirst ? 1 : 0)
      // 달력 정보, 관련 데이터 분리 | 날짜 정보(휴일 등)
      let mt = moment().set({
        'year': year,
        'month': month,
        'date': day
      })
      // console.log(year, month, day, isMondayFirst, this.calFirstDate)
      let from = mt.clone().startOf('week').add(isMondayFirst, 'day')
      if (isMondayFirst && from > mt) from.add(-1, 'week')
      // if (this.calPrevDate.getMonth() !== this.calFirstDate.getMonth()) from.add(-1, 'week')
      let to = from.clone().add(1, 'week')
      // console.log(mt, from, to)

      weekList = _(+from).range(+to, 86400000).map(date => {
        let info = {
          date: new Date(date),
          isCurMonth: mt.isSame(date, 'month'),
          hasTask: false
        }
        info.isHoliday = info.date.getDay() === 0
        thisMonthDays.push(info)
        return info
      }).chunk(7).value()
      this.calObj = weekList
      this.$emit('weekChange', {
        firstDate: new Date(this.calFirstDate),
        days: thisMonthDays,
        cal: weekList
      })
      this.calPrevDate = this.calFirstDate
      this.selectedMonth = null
    },
    nextWeek() {
      this.calFirstDate.setDate(this.calFirstDate.getDate() + 7)
      this.getCurWeek(this.calFirstDate.getFullYear(), this.calFirstDate.getMonth(), this.calFirstDate.getDate(), this.isMondayFirst)
      this.selectedMonth = null
      this.$forceUpdate()
    },
    previousWeek() {
      this.calFirstDate.setDate(this.calFirstDate.getDate() - 7)
      this.getCurWeek(this.calFirstDate.getFullYear(), this.calFirstDate.getMonth(), this.calFirstDate.getDate(), this.isMondayFirst)
      this.selectedMonth = null
      this.$forceUpdate()
    },
    onSelected(day) {
      this.$store.state.selectedDate = day.date.toString()
      this.selectedMonth = moment(day.date.toString())
      // console.log(this.selectedMonth)
      this.$emit('selectedDateChange', this.$store.state.selectedDate)
      // if (day.isCurMonth) {
      // }
    },
    onSwipeLeft(e) {
      // console.log('onSwipeLeft', e)
      this.nextWeek()
    },
    onSwipeRight(e) {
      // console.log('onSwipeRight', e)
      this.previousWeek()
    },
    onSwipeDown(e) {
      this.$emit('weekCalSwipeDown', e)
    }
},
  computed: {
    selectedDate() {
      return this.$store.getters.getSelectedDate
    }
  },
  templateSrc: './weekCalendar.html'
}
