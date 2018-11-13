import req2svr from './req2svr'
import moment from 'moment'
import alert from '~/popup/alert/alert'
import eduRequestList from '~/edu/eduRequestList/eduRequestList'
import listPopup from '~/popup/list/list'

export default {
  name: 'eduRequest',
  props: ['COSE_ID', 'COSE_OPEN_ID', 'formTute'],
  inject: ['popup'],
  data() {
    return {
      coseInCoseData: {},
      downloadCnt: 0,
      fileList: [],
      bus: new Vue(),
      pl_list_j: [],
      APPR_EMP1: { EMP_NM: '', EMP_NO: '' },
      APPR_EMP2: { EMP_NM: '', EMP_NO: '' },
      directAppr: 'N',
      noti: []
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.getEduInCoseData()
    }, 0)
  },
  beforePopup(done) {
    return done()
  },
  mounted() {
    this.$store.dispatch('getCountList', 'REQUESTLIST')
    this.bus.$on('downloaded', x => {
      _.forEach(this.fileList, (v, i) => {
        if (v.SEQ_NO === x.SEQ_NO) {
          v.isDownload = true
        }
      })
    })
  },
  methods: {
    getEduInCoseData() {
      return this.req2svr
        .popEduInCoseAppl({
          COSE_ID: this.COSE_ID,
          COSE_OPEN_ID: this.COSE_OPEN_ID,
          I_SRCH_AUTH: ''
        })
        .then(r => {
          this.coseInCoseData = r
          this.pl_list_j = r.pl_list_j
          this.APPR_EMP2 = { EMP_NM: r.APPR_EMP_NM2, EMP_NO: '' } // _.assign(this.APPR_EMP2, r.APPR_EMP_NM2)
          this.noti = r.noti
          if (r.directAppr === 'Y') {
            this.directAppr = 'Y'
          }
          this.openApprSelectPopup()
          this.$forceUpdate()
          if (this.coseInCoseData.FILE_NO !== '') {
            this.req2svr
              .getEduTutoFileList({
                COSE_ID: this.COSE_ID + '',
                FILE_NO: this.coseInCoseData.FILE_NO + ''
              })
              .then(r => {
                if (r.fileList && r.fileList.length > 0) {
                  this.fileList = r.fileList
                }
              })
          }
        })
    },
    // 결재자 1명 이상일시 첫화면에서 팝업
    openApprSelectPopup() {
      if (this.pl_list_j.length > 1) {
        if (this.directAppr === 'Y') {
          this.pl_list_j.unshift({ EMP_NM: '담당결재', EMP_NO: '' })
        }
        let selectList = this.pl_list_j

        this.popup
          .open(listPopup, {
            selectList
          })
          .then(r => {
            if (r.btn.value) {
              this.APPR_EMP1 = _.assign(this.APPR_EMP1, r.selectedItem)
            } else {
              this.$emit('closePop', true)
            }
          })
      } else {
        this.APPR_EMP1 = _.assign(this.APPR_EMP1, {
          EMP_NM: this.coseInCoseData.APPR_EMP_NM1,
          EMP_NO: this.coseInCoseData.APPR_P_EMP_NO
        })
      }
    },
    saveEduCoseOpenApplCancel() {
      this.req2svr
        .saveEduCoseOpenApplCancel({
          COSE_ID: this.COSE_ID + '',
          COSE_OPEN_ID: this.COSE_OPEN_ID + '',
          AUTO_APP_YN: this.coseInCoseData.AUTO_APP_YN,
          TUTE_ID: this.coseInCoseData.TUTE_ID,
          APPR_ID: this.coseInCoseData.APPR_ID,
          APPR_P_EMP_NO: this.APPR_EMP1.EMP_NO,
          REJ_NOTE: ''
        })
        .then(r => {
          let msg = r.result
          this.popup
            .open(alert, {
              msg
            })
            .then(() => {
              this.getEduInCoseData()
            })
        })
    },
    saveEduCoseOpenAppl() {
      // 모바일에서는 다운받아도 파일 실행이 안되므로 강제 파일다운로드 주석처리
      // let isValid = true
      // _.forEach(this.fileList, (v, i) => {
      //   if (!v.isDownload) {
      //     isValid = false
      //   }
      // })
      // if (!isValid) {
      //   return this.popup.open(alert, {
      //     msg: '신청 전에 사전학습자료를\n다운로드 받으셔야 합니다.',
      //     btnList: [
      //       {
      //         text: '확인',
      //         value: true
      //       }
      //     ]
      //   })
      // }
      this.req2svr
        .saveEduCoseOpenAppl({
          COSE_ID: this.COSE_ID + '',
          COSE_OPEN_ID: this.COSE_OPEN_ID + '',
          AUTO_APP_YN: this.coseInCoseData.AUTO_APP_YN,
          TUTE_ID: '',
          APPR_ID: '',
          APPR_P_EMP_NO: this.APPR_EMP1.EMP_NO,
          REJ_NOTE: ''
        })
        .then(r => {
          let msg = r.result
          if (r.status === 'ok') {
            this.popup
              .open(alert, {
                msg,
                btnList: [
                  {
                    text: '확인',
                    value: false
                  },
                  {
                    text: '교육 신청함',
                    value: true
                  }
                ]
              })
              .then(rxx => {
                this.getEduInCoseData()
                if (rxx.btn.value) {
                  this.openEduRequestList()
                } else {
                  // this.$emit('closePop', true)
                }
              })
          } else {
            this.popup.open(alert, {
              msg
            })
          }
        })
    },
    openEduRequestList() {
      this.popup.open(eduRequestList, { fromAList: true }, this)
    }
  },
  computed: {
    today: () => moment().format('YYYY.MM.DD'),
    req2svr: () => req2svr
  },
  templateSrc: './eduRequest.html'
}
