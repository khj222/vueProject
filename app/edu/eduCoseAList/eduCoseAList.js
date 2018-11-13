import req2svr from './req2svr'
import moment from 'moment'
import alert from '~/popup/alert/alert'
import eduRequestList from '~/edu/eduRequestList/eduRequestList'
import listPopup from '~/popup/list/list'

export default {
  name: 'eduCoseAList',
  inject: ['popup'],
  data() {
    return {
      SEARCH_STA_DATE: moment()
        .startOf('year')
        .format('YYYY-MM-DD'),
      SEARCH_END_DATE: moment()
        .endOf('year')
        .format('YYYY-MM-DD'),
      list: [],
      dataList: [],
      coseInCoseData: {},
      paginationInfo: {},
      getEduCosePageIndex: 1,
      openList: [],
      openDataList: [],
      openPaginationInfo: {},
      getEduCoseOpenPageIndex: 1,
      coseData: {},
      coseOpenData: {},
      fileList: [],
      bus: new Vue(),
      SEARCH_COSE_NM: '',
      SEARCH_EDU_MY_FIT: '',
      pl_list_j: [],
      APPR_EMP1: { EMP_NM: '', EMP_NO: '' },
      APPR_EMP2: { EMP_NM: '', EMP_NO: '' },
      directAppr: 'N',
      noti: []
    }
  },
  afterEnter() {
    setTimeout(() => {
      let promiseList = []
      this.getEduCoseList().then(r => {
        if (this.paginationInfo.lastPageNo > 1) {
          while (this.getEduCosePageIndex < this.paginationInfo.lastPageNo) {
            let i = this.getEduCosePageIndex - 1
            this.getEduCosePageIndex++
            promiseList[i] = this.getEduCoseList()
          }
        }
        Promise.all(promiseList).then(r => {
          this.coseSelectPopup()
        })
      })

      // this.getEduInCoseData()
    }, 0)
  },
  beforePopup(done) {
    return done()
  },
  mounted() {
    this.bus.$on('downloaded', x => {
      _.forEach(this.fileList, (v, i) => {
        if (v.SEQ_NO === x.SEQ_NO) {
          v.isDownload = true
        }
      })
    })
  },
  methods: {
    //  첫화면에서 팝업
    coseSelectPopup() {
      let selectList = _.filter(this.dataList, o => {
        return o.APP_ENABLE_YN === '0000'
      })

      this.popup
        .open(listPopup, {
          title: '과정선택',
          msg: '과정을 선택해 주세요.',
          selectList,
          showText: 'COSE_NM'
        })
        .then(r => {
          if (r.btn.value) {
            this.coseData = r.selectedItem
            this.coseSelect()
          } else {
            this.$emit('closePop', true)
          }
        })
    },
    isCompleted() {
      return (
        Object.keys(this.coseData).length > 0 &&
        Object.keys(this.coseOpenData).length > 0 &&
        Object.keys(this.coseInCoseData).length > 0
      )
    },
    coseOpenSelect() {
      this.getEduInCoseData()
    },
    coseSelect() {
      this.openList = []
      this.openDataList = []
      this.openPaginationInfo = {}
      this.getEduCoseOpenPageIndex = 1
      this.coseOpenData = {}
      this.coseInCoseData = {}
      this.paginationInfo = {}
      this.getEduCosePageIndex = 1
      this.getEduCoseOpenList().then(r => {
        if (this.openPaginationInfo.lastPageNo > 1) {
          while (this.getEduCoseOpenPageIndex < this.openPaginationInfo.lastPageNo) {
            this.getEduCoseOpenPageIndex++
            this.getEduCoseOpenList()
          }
        }
      })

      this.req2svr
        .getEduTutoFileList({
          COSE_ID: this.coseData.COSE_ID,
          FILE_NO: this.coseData.FILE_NO
        })
        .then(r => {
          if (r.fileList && r.fileList.length > 0) {
            this.fileList = r.fileList
          }
        })
    },
    getEduCoseOpenList() {
      return this.req2svr
        .getEduCoseOpenList({
          COSE_ID: this.coseData.COSE_ID,
          ORDER_BY: 'Y',
          OPEN_YN: 'Y',
          SEARCH_EDU_STA_DATE: this.SEARCH_STA_DATE,
          SEARCH_EDU_END_DATE: this.SEARCH_END_DATE,
          SEARCH_EDU_PLAC_CD: this.SEARCH_EDU_PLAC_CD,
          SEARCH_EDU_AREA_CD: this.SEARCH_EDU_AREA_CD,
          pageIndex: this.getEduCoseOpenPageIndex
        })
        .then(r => {
          this.openList = r.data
          this.openList = _.filter(this.openList, v => {
            return (
              v.TARGET_YN !== 'N' &&
              v.APP_PERIOD_BEF_YN !== 'Y' &&
              v.APP_PERIOD_YN !== 'N' &&
              v.APP_LIMT_OVER_YN !== 'Y'
            )
          })
          this.openList = _.concat(this.openDataList, this.openList)
          this.openDataList = this.openList
          this.openPaginationInfo = r.paginationInfo
        })
    },

    getEduCoseList() {
      return this.req2svr
        .getEduCoseList({
          OPEN_YN: 'Y',
          // SEARCH_EDU_STA_DATE: this.SEARCH_STA_DATE,
          // SEARCH_EDU_END_DATE: this.SEARCH_END_DATE,
          SEARCH_COSE_NM: this.SEARCH_COSE_NM,
          SEARCH_EDU_MY_FIT: this.SEARCH_EDU_MY_FIT,
          pageIndex: this.getEduCosePageIndex,
          APP_PERIOD_YN: 'Y',
          EDU_END_YN: 'N',
          TARGET_YN: 'Y'
        })
        .then(r => {
          this.list = r.data
          this.list = _.concat(this.dataList, this.list)
          this.dataList = this.list
          this.paginationInfo = r.paginationInfo
        })
    },
    getEduInCoseData() {
      this.APPR_EMP1 = { EMP_NM: '', EMP_NO: '' }
      this.APPR_EMP2 = { EMP_NM: '', EMP_NO: '' }
      this.req2svr
        .popEduInCoseAppl({
          COSE_ID: this.coseData.COSE_ID,
          COSE_OPEN_ID: this.coseOpenData.COSE_OPEN_ID,
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
          COSE_ID: this.coseData.COSE_ID,
          COSE_OPEN_ID: this.coseOpenData.COSE_OPEN_ID,
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
            .then(rx => {
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
          COSE_ID: this.coseData.COSE_ID,
          COSE_OPEN_ID: this.coseOpenData.COSE_OPEN_ID,
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
  templateSrc: './eduCoseAList.html'
}
