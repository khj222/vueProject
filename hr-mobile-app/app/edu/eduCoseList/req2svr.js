import http from '~/util/http'
export default {
  getEduCoseList: http.post('/hns/edu/edured/getEduCoseList.json')
}
