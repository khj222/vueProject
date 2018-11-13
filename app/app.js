import './app.css'
import './css/index/common.css'
import './css/index/ico.css'
import './css/index/extra.css'
import req2svr from './req2svr'
import popupMixin from '~/mixins/popupMixin'
import pagesMixin from '~/mixins/pagesMixin'
import push from '~/util/push'
import { $afterAppMounted } from '~/util/provider.mjs'
import Vue from 'vue'
import alert from '~/popup/alert/alert'
import constant from '@constant'

export default {
  name: 'app',
  mixins: [popupMixin, pagesMixin],
  data() {
    return {}
  },
  beforeMount() {
    Vue.app = this
    // eslint-disable-next-line no-unused-vars
    // let [android, androidVersion] = navigator.userAgent.match(/android\s([.0-9]*)/i) || []
    let android = navigator.userAgent.match(/android\s([.0-9]*)/i)
    if (android) document.body.classList.add('android')
  },
  mounted() {
    setTimeout(() => $afterAppMounted.resolve(this), 0)
  },
  back() {
    this.popup
      .open(alert, {
        msg: '앱을 종료 하시겠습니까?',
        btnList: [{ text: '예', value: true }, { text: '아니오', value: false }]
      })
      .then(r => r.btn.value && navigator.app.exitApp(), null)
  },
  provide() {
    return {
      push,
      constant,
      req2svr,
      popup: this.popup,
      alert: this.alert,
      confirm: this.confirm,
      pages: this.pages,
      checkFunction: target => !!this.$store.state.user.data.auth[target]
    }
  },
  templateSrc: './app.html'
}
