import http from '~/util/http'

export default {
  getBasicInfoImg: http.post('/hns/personnel/basicInfo/getBasicInfoImg.json'),
  getBasicInfoDetail: http.post('/hns/personnel/basicInfo/getBasicInfoDetail.json'),
  getEmpWorkHoliTamDay: http.post('/hns/personnel/appform/workholiapp/getEmpWorkHoliTamDay.json'),
  pushList: http.post('/mhr/push/pushList.json'),
  getSurveyList: http.post('/mhr/survey/list.json')
}
