import loginPage from '~/login/login'

export default {
  name: 'login',
  methods: {
    success () {
      this.$emit('closePop', true)
    }
  },
  back () {
    this.$emit('closePop', false)
  },
  components: {loginPage},
  templateSrc: './login.html'
}
