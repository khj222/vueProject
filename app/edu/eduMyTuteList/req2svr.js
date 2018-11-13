import http from '~/util/http'
export default {
  getMyEduTuteList: http.post('/hns/edu/eduapp/getMyEduTuteList.json')
}
