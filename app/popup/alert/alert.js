export default {
  name: 'alert',
  props: {
    title: {
      type: String,
      default: '알림'
    },
    msg: {
      type: String,
      default: ''
    },
    btnList: {
      type: Array,
      default () { return [{text: '확인', value: true}] }
    }
  },
  back () {
    this.$emit('closePop', true, {index: -1, btn: {text: null, value: false}})
  },
  data () { return {} },
  methods: {
    onBtnClick (index, btn) {
      this.$emit('closePop', !btn.reject, {index, btn})
    }
  },
  templateSrc: './alert.html',
  styleSrc: './alert.css'
}
