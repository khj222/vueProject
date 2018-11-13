export default {
  data () { return {show: false, args: [], enterPromise: null, beforeTransitionMethodEnd: false} },
  beforeMount () {
    this.enterPromise = new Promise(resolve => {
      if (this.$parent.$options.beforeTransition) this.$parent.$options.beforeTransition.call(this.$parent, resolve)
      else {
        this.beforeTransitionMethodEnd = true
        resolve()
      }
    })
  },
  mounted () {
    this.enterPromise && this.enterPromise.then(r => {
      this.beforeTransitionMethodEnd = true
      if (r === false) {
        this.close()
      } else {
        this.changeShow(true)
        this.$parent.$on('closePop', this.closePop)
      }
    })
  },
  back () {
    if (this.$parent.$options.back) this.$parent.$options.back.apply(this.$parent) // 백이 구현 되어 있으면 호출
    else this.closePop() // 되어 있지 않으면 기본 닫기
  },
  methods: {
    changeShow (tf) {
      setTimeout(() => { this.show = tf }, 0)
    },
    afterEnter (el) {
      if (this.$parent.$options.afterEnter) {
        this.$parent.$options.afterEnter.call(this.$parent, el)
      }
    },
    closePop (...args) {
      this.args = args
      if (this.$parent.$options.beforeTransitionLeave) this.$parent.$options.beforeTransitionLeave.call(this.$parent)
      this.changeShow(false)
    },
    close (...args) {
      this.$parent.$emit('close', ...(args.length ? args : this.args))
    },
    afterLeave () {
      this.close()
      // this.$store.commit('fadeMoving[set]', this.$store.state.fadeMoving - 1)
    },
    beforeEnter () { 
      // this.$store.commit('fadeMoving[set]', this.$store.state.fadeMoving + 1)
    },
    beforeLeave () {
      // this.$store.commit('fadeMoving[set]', this.$store.state.fadeMoving + 1)
    }
  }
}
