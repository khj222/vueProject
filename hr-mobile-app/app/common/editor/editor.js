import MediumEditor from 'medium-editor'

export default {
  name: 'editor',
  props: ['value'],
  data () { return {editor: null, empty: false} },
  mounted () {
    this.editor = new MediumEditor(this.$refs.edit, {toolbar: false})
    this.editor.setContent(this.value)
  },
  beforeDestory () {
    this.editor.destroy()
  },
  methods: {
    input () {
      this.$emit('input', this.editor.getContent())
    }
  },
  templateSrc: './editor.html'
}
