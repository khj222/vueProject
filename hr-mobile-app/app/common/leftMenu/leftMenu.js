export default {
  name: 'left-menu',
  props: ['open'],
  data() {
    return {}
  },
  computed: {},
  mounted() {},
  methods: {
    closeMenu(ev) {
      if (
        ev.target === this.$el ||
        ev.target.offsetParent === this.$el.querySelector('.btn_close')
      ) {
        this.$parent.isOpenMenu = false
      }
    },
    logout() {
      this.$store.dispatch('user[logout]').then(
        res => {
          window.localStorage.setItem('auto_login_id', '')
          window.localStorage.setItem('auto_password', '')
          this.$router.push({
            path: '/login'
          })
        },
        err => console.error(err)
      )
    }
  },
  templateSrc: './leftMenu.html'
}
