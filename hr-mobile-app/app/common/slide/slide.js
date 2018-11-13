import popupTransMixin from '../popupTransMixin'

export default {
  name: 'slide',
  mixins: [popupTransMixin],
  methods: {
    beforeEnter () {
      this.$store.commit(`slideShowTrueCount[increase]`)
    },
    beforeLeave () {
      this.$store.commit(`slideShowTrueCount[decrease]`)
    }
  },
  templateSrc: './slide.html',
  styleSrc: './slide.css'
}
