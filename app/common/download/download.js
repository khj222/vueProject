import constant from '@constant'
import cordova from '~/util/cordova'

export default {
  name: 'download',
  inject: ['alert', 'confirm'],
  props: ['file', 'bus'],
  methods: {
    download() {
      if (this.bus) {
        this.bus.$emit('downloaded', this.file)
      }
      let url = `${constant.baseURL}/commFile/downloadAppFiles.do?FILE_NO=${
        this.file.FILE_NO
      }&SEQ_NO=${this.file.SEQ_NO || ''}`
      let fileName = this.file.FILE_NM_ORG || ''
      cordova.file.downloadWithNoti(url, fileName).then(
        file => {
          if (file) return
          let append =
            window.cordova.platformId === 'android' ? '\n다운로드 폴더를 확인해주세요.' : ''
          this.alert('파일을 열 수 있는 앱이 없습니다.' + append)
        },
        e => {
          if (e instanceof Error && e.message === 'Notification Permission Denied') {
            this.alert('알림을 허용해 주세요.')
          }
          console.error(e)
        }
      )
    }
  },
  templateSrc: './download.html'
}
