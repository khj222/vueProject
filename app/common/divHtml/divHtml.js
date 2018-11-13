import constant from '@constant'

export default {
  name: 'div-html',
  props: ['html'],
  computed: {
    content () {
      return this.html && this.html.replace(/(['"])(\/downloadFile\?file_id=)/g, '$1' + constant.baseURL + '$2')
    }
  },
  templateSrc: './divHtml.html'
}
