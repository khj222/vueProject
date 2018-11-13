import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'calendar',

  data() {
    return {
      today: new Date(),
      calFirstDate: moment().toDate(),
      calObj: [],
      isMondayFirst: false,
      weekDays: [],
      calFristWeek:
        moment().week() -
        moment()
          .startOf('month')
          .week() +
        1
    }
  },
  mounted() {
    this.weekDays = _(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'])
      [this.isMondayFirst ? 'push' : 'unshift']('SUNDAY')
      .value()
  },

  methods: {
    init() {
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst
      )
    },
    getCurMonth(year, month, day, isMondayFirst, isWeekChange) {
      // console.log(this.calFristWeek)
      this.$store.state.selectedDate = null
      let weekList
      let thisMonthDays = []
      isMondayFirst = isMondayFirst ? 1 : 0

      // 달력 정보, 관련 데이터 분리 | 날짜 정보(휴일 등)
      let mt
      if (!isWeekChange) {
        mt = moment()
          .startOf('day')
          .set('year', year)
          .set('month', month)
          .startOf('month')
      } else {
        mt = moment().set({
          year: year,
          month: month,
          date: day
        })
      }
      // console.log(year, month, day, isMondayFirst, this.calFirstDate)
      let from = mt
        .clone()
        .startOf('week')
        .add(isMondayFirst, 'day')
      if (isMondayFirst && from > mt) from.add(-1, 'week')
      let to
      if (!isWeekChange) {
        to = from.clone().add(6, 'week')
      } else {
        to = from.clone().add(1, 'week')
      }
      // console.log(mt, from, to)

      weekList = _(+from)
        .range(+to, 86400000)
        .map(date => {
          // console.log(date)
          let info = {
            date: new Date(date),
            isCurMonth: mt.isSame(date, 'month'),
            hasTask: false,
            hasOverWork: false,
            YMD: moment(date).format('YYYYMMDD'),
            TAM_NM: null
          }
          info.isHoliday = info.date.getDay() === 0
          thisMonthDays.push(info)
          return info
        })
        .chunk(7)
        .value()
      this.calObj = weekList
      this.$emit('monthChange', {
        firstDate: new Date(this.calFirstDate),
        days: thisMonthDays,
        cal: weekList
      })
    },
    nextMonth() {
      this.calFirstDate.setMonth(this.calFirstDate.getMonth() + 1)
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst
      )
      this.$forceUpdate()
    },
    previousMonth() {
      this.calFirstDate.setMonth(this.calFirstDate.getMonth() - 1)
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst
      )
      this.$forceUpdate()
    },
    nextWeek() {
      this.calFirstDate.setDate(this.calFirstDate.getDate() + 7)
      this.calFristWeek = 1
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst,
        true
      )
      this.$forceUpdate()
    },
    previousWeek() {
      this.calFirstDate.setDate(this.calFirstDate.getDate() - 7)
      this.calFristWeek = 1
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst,
        true
      )
      this.$forceUpdate()
    },
    restoreMonCal() {
      this.getCurMonth(
        this.calFirstDate.getFullYear(),
        this.calFirstDate.getMonth(),
        this.calFirstDate.getDate(),
        this.isMondayFirst
      )
      this.$forceUpdate()
    },
    onSelected(day) {
      // if (day.isCurMonth) {
      this.$store.state.selectedDate = day.date.toString()
      this.$emit('selectedDateChange', this.$store.state.selectedDate)
      // }
    }
  },
  beforeDestroy() {
    this.$store.state.selectedDate = null
  },
  computed: {
    selectedDate() {
      return this.$store.getters.getSelectedDate
    }
  },
  templateSrc: './calendar.html'
}
