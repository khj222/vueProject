import http from '~/util/http'
export default {
  getEduTuteApprPList: http.post('/hns/edu/eduagr/getEduTuteApprPList.json'),
  popEduInCoseAppl: http.post('/hns/edu/eduapp/popEduInCoseAppl.do'),
  getEduTutoFileList: http.post('/hns/edu/edured/getEduTutoFileList.json'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  saveEduCoseOpenApplCancel: http.post('/hns/edu/eduapp/saveEduCoseOpenApplCancel.json'),
  saveEduApplApproval: http.post('/hns/edu/eduapp/saveEduApplApproval.json'),
  saveEduApplReturn: http.post('/hns/edu/eduapp/saveEduApplReturn.json')
}
