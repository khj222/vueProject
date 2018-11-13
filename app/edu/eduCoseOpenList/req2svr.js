import http from '~/util/http'
export default {
  getEduCoseOpenList: http.post('/hns/edu/edured/getEduCoseOpenList.json'),
  getEduTutoFileList: http.post('/hns/edu/edured/getEduTutoFileList.json'),
  downloadAppFiles: http.get('/commFile/downloadAppFiles.do'),
  getCommonCodeIdxDtlList: http.post('/sym/program/getCommonCodeIdxDtlList.json'),
  popEduInCoseOpen: http.post('/hns/edu/eduapp/popEduInCoseOpen.do')
}
