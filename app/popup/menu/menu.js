import popup from '~/util/popup'
export default {
  name: 'menu',
  props: {
    pageName: {
      type: String,
      default: ''
    }
  },
  back() {
    this.$emit('closePop', true, { index: -1, btn: { text: null, value: false } })
  },
  data() {
    return {}
  },
  methods: {
    checkMenu(item) {
      if (
        (this.pageName.toUpperCase().indexOf('CONFIRMLIST') > -1 &&
          item.id.toUpperCase().indexOf('CONFIRMLIST') > -1 &&
          this.pageName !== item.id) ||
        (this.pageName.toUpperCase().indexOf('REQUESTLIST') > -1 &&
          item.id.toUpperCase().indexOf('REQUESTLIST') > -1 &&
          this.pageName !== item.id)
      ) {
        return true
      } else {
        return false
      }
    },
    open(name, props) {
      popup.open(this.$store.state.child[name], props, this.$parent)
      this.$emit('closePop', true, { index: -1, btn: { text: null, value: 'open' } })
    },
    hideMenu() {
      this.$emit('closePop', true, { index: -1, btn: { text: null, value: false } })
    },
    onBtnClick(index, btn) {
      this.$emit('closePop', !btn.reject, { index, btn })
    }
  },
  templateSrc: './menu.html',
  styleSrc: './menu.css'
}
