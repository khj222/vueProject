export default {
  name: 'add-file',
  props: {files: Array, hasEnter: {default: true}},
  data () {
    return {edit: this.$attrs.hasOwnProperty('edit'), noThumb: this.$attrs.hasOwnProperty('no-thumb')}
  },
  computed: {
    attached () {
      let ret = {images: [], files: []}
      this.files && this.files.forEach(x => {
        if (!this.noThumb && /^image\//.test(x.file_type)) ret.images.push(x)
        else ret.files.push(x)
      })
      return ret
    }
  },
  templateSrc: './addFile.html'
}
