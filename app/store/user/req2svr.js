import http from '~/util/http'

export default {
  login: http.post('/uat/uia/actionSecurityLogin.do', null, false),
  logout: http.post('/uat/uia/actionLogout.do'),
  check: http.post('/mhr/push/pushUpdate.json', null, true),
  versionCheck: http.post('/mhr/uat/version.json'),
  getAppApprMngOverTimePList: http.post(
    '/hns/personnel/appform/appapprmng/getAppApprMngOverTimePList.json'
  ),
  getAppApprMngList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngList.json'),
  pushList: http.post('/mhr/push/pushList.json'),
  getSurveyList: http.post('/mhr/survey/list.json'),
  getAppApprMngPList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngPList.json'),
  getEduTuteApprPList: http.post('/hns/edu/eduagr/getEduTuteApprPList.json')
}
