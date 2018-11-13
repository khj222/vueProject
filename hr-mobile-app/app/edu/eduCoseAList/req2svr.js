import http from '~/util/http'
export default {
  getEduCoseList: http.post('/hns/edu/edured/getEduCoseList.json'),
  getEduCoseOpenList: http.post('/hns/edu/edured/getEduCoseOpenList.json'),
  getEduTutoFileList: http.post('/hns/edu/edured/getEduTutoFileList.json'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  getCommonCodeIdxDtlList: http.post('/sym/program/getCommonCodeIdxDtlList.json'),
  popEduInCoseOpen: http.post('/hns/edu/eduapp/popEduInCoseOpen.do'),
  popEduInCoseAppl: http.post('/hns/edu/eduapp/popEduInCoseAppl.do'),
  saveEduCoseOpenAppl: http.post('/hns/edu/eduapp/saveEduCoseOpenAppl.json'),
  saveEduCoseOpenApplCancel: http.post('/hns/edu/eduapp/saveEduCoseOpenApplCancel.json')
}
