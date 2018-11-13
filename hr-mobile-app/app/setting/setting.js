import req2svr from './req2svr'
import pwChange from '~/password/change/change'
import alert from '~/popup/alert/alert'

export default {
  name: 'setting',
  inject: ['push', 'popup'],
  templateSrc: './setting.html',
  data() {
    return {
      pushIsEnabled: false,
      isActive: false,
      name: this.$store.state.user.data.customer_name || this.$store.state.user.data.user_name,
      isDevLogin: this.$store.state.user.data.is_dev_login
    }
  },
  mounted() {
    this.pushIsEnabled = this.$store.state.push_yn === 'Y'
  },
  methods: {
    logout() {
      this.$store.dispatch('user[logout]').then(
        res => {
          window.localStorage.setItem('auto_login_id', '')
          window.localStorage.setItem('auto_password', '')
          this.$router.push({
            path: '/login'
          })
          this.$emit('closePop')
        },
        err => console.error(err)
      )
    },
    openPwChange() {
      this.popup.open(pwChange, {}, this)
    },
    pushChange() {
      this.push
        .getRegistId()
        .catch(() => {})
        .then(res => {
          req2svr
            .pushUpdate({
              push_token: res,
              uuid: window.device ? window.device.uuid : null,
              push_yn: this.pushIsEnabled ? 'Y' : 'N'
            })
            .then(r => {
              if (r.result !== 'OK') {
                this.popup.open(
                  alert,
                  {
                    msg: r.result
                  },
                  this
                )
              }
            })
        })
    }
  }
}
