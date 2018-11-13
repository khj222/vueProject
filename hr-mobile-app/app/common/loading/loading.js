import spinner from './spinner/spinner'

export default {
  name: 'loading',
  data () { return {n: 0, isShow: false} },
  methods: {
    show (promise, immediate) {
      this.n++
      if (this.n === 1) {
        if (promise) {
          setTimeout(() => {
            if (this.n > 0) this.isShow = true
          }, immediate ? 0 : 600, false) // 600ms넘게 로딩중일때만 로딩화면표시
        } else this.isShow = true
      }
      if (promise && promise.then) {
        return promise.then(this.hide, (e) => {
          return Promise.reject(this.hide(e))
        })
      }
      return promise
    },
    hide (r) {
      this.n--
      if (this.n > 0) return r
      this.n = 0
      this.isShow = false
      return r
    }
  },
  components: {spinner},
  templateSrc: './loading.html',
  styleSrc: './loading.css'
}
