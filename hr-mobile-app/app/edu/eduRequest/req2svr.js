import http from '~/util/http'
export default {
  popEduInCoseAppl: http.post('/hns/edu/eduapp/popEduInCoseAppl.do'),
  getEduTutoFileList: http.post('/hns/edu/edured/getEduTutoFileList.json'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  saveEduCoseOpenAppl: http.post('/hns/edu/eduapp/saveEduCoseOpenAppl.json'),
  saveEduCoseOpenApplCancel: http.post('/hns/edu/eduapp/saveEduCoseOpenApplCancel.json')
}
