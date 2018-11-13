import http from '~/util/http'
export default {
  getMyEduTuteList: http.post('/hns/edu/eduapp/getMyEduTuteList.json'),
  popEduInCoseAppl: http.post('/hns/edu/eduapp/popEduInCoseAppl.do'),
  getEduTutoFileList: http.post('/hns/edu/edured/getEduTutoFileList.json'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  saveEduCoseOpenApplCancel: http.post('/hns/edu/eduapp/saveEduCoseOpenApplCancel.json')
}
