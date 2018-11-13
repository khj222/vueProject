import http from '~/util/http'
export default {
  getMyEduTuteList: http.post('/hns/edu/eduapp/getMyEduTuteList.json'),
  getEduServItemList: http.post('/hns/edu/edured/getEduServItemList.json'),
  saveEduServPart: http.post('/hns/edu/eduapp/saveEduServPart.json'),
  popServPart: http.post('/hns/edu/eduapp/popServPart.do')
}
