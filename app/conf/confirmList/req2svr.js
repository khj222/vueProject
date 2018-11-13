import http from '~/util/http'
export default {
  getAppApprMngOverTimePList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngOverTimePList.json'),
  reqAppApprApprove: http.post('/hns/personnel/appform/appapprmng/reqAppApprApprove.json'),
  reqAppApprReturnP: http.post('/hns/personnel/appform/appapprmng/reqAppApprReturnP.json'),
  getUserListPop: http.post('/hns/cmm/getUserListPop.json'),
  reqOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/reqOverTimeApp.do'),
  getTamShiftInfo: http.post('/hns/personnel/appform/overtimeapp/getTamShiftInfo.json'),
  getCommonCodeIdxDtlList: http.post('/sym/program/getCommonCodeIdxDtlList.json'),
  execOverTimeAppChk: http.post('/hns/personnel/appform/overtimeapp/execOverTimeAppChk.json'),
  insertOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/insertOverTimeApp.json')
}
