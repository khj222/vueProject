import http from '~/util/http'
export default {
  getEduDashBoard: http.post('/hns/edu/edubod/getEduDashBoard.do'),
  getMyEduTuteList: http.post('/hns/edu/eduapp/getMyEduTuteList.json')
}
