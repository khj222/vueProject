import req2svr from './req2svr'
import staff from './staff/staff'
import cordova from '~/util/cordova'

export default {
  name: 'main',
  props: [],
  data() {
    return {
      isStaff: true
    }
  },
  mounted() {
    cordova.statusBar.backgroundColorByHexString('#ce3d53')
  },
  computed: {
    slide() {
      return this.$store.state.slideShowTrueCount
    }
  },
  provide: {
    req2svr
  },
  components: {
    staff
  },
  templateSrc: './main.html',
  styleSrc: './main.css'
}
