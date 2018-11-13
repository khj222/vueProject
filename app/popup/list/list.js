export default {
  name: 'list',
  props: {
    title: {
      type: String,
      default: '결재자 지정'
    },
    msg: {
      type: String,
      default: '결재자를 선택해 주세요.'
    },
    btnList: {
      type: Array,
      default() {
        return [{ text: '취소', value: false }, { text: '확인', value: true }]
      }
    },
    selectList: {
      type: Array
    },
    showText: {
      type: String,
      default: 'EMP_NM'
    }
  },
  back() {
    // this.$emit('closePop', true, {
    //   index: -1,
    //   btn: { text: null, value: false }
    // })
  },
  data() {
    return {
      selectedItem: null
    }
  },
  methods: {
    onBtnClick(index, btn) {
      if (this.selectedItem !== null) {
        let selectedItem = this.selectedItem
        this.$emit('closePop', !btn.reject, { index, btn, selectedItem })
      } else if (btn.value === false) {
        this.$emit('closePop', !btn.reject, { index, btn })
      }
    }
  },
  templateSrc: './list.html',
  styleSrc: './list.css'
}
