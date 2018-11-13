import http from '~/util/http'
export default {
  getAppApprMngOverTimePList: http.post(
    '/hns/personnel/appform/appapprmng/getAppApprMngOverTimePList.json'
  ),
  reqAppApprApprove: http.post('/hns/personnel/appform/appapprmng/reqAppApprApprove.json'),
  reqAppApprReturnP: http.post('/hns/personnel/appform/appapprmng/reqAppApprReturnP.json'),
  getUserListPop: http.post('/hns/cmm/getUserListPop.json'),
  reqOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/reqOverTimeApp.do'),
  getTamShiftInfo: http.post('/hns/personnel/appform/overtimeapp/getTamShiftInfo.json'),
  getCommonCodeIdxDtlList: http.post('/sym/program/getCommonCodeIdxDtlList.json'),
  execOverTimeAppChk: http.post('/hns/personnel/appform/overtimeapp/execOverTimeAppChk.json'),
  insertOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/insertOverTimeApp.json'),
  getAppApprMngPList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngPList.json'),
  reqAppApprMngP: http.post('/hns/personnel/appform/appapprmng/reqAppApprMngP.json'),
  getAppApprMngList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngList.json'),
  reqWorkHoliApp: http.post('/hns/personnel/appform/workholiapp/reqWorkHoliApp.do'),
  popPayAcntChgView: http.post('/hns/personnel/appform/payacntchg/popPayAcntChgView.do'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  tamShiftAppReqPop: http.post('/hns/personnel/appform/tamshiftapp/tamShiftAppReqPop.do'),
  getEmpWorkHoliTamDay: http.post('/hns/personnel/appform/workholiapp/getEmpWorkHoliTamDay.json'),
  getRemainingDays: http.post('/hns/personnel/appform/workholiapp/getRemainingDays.json'),
  getWorkHoliAppList: http.post('/hns/personnel/appform/workholiapp/getWorkHoliAppList.json'),
  getOverTimeAppList: http.post('/hns/personnel/appform/overtimeapp/getOverTimeAppList.json'),
  getRestAppList: http.post('/hns/personnel/appform/restapp/getRestAppList.json'),
  getWorkLeavAppList: http.post('/hns/personnel/appform/workleavapp/getWorkLeavAppList.json'),
  insertWorkHoliApp: http.post('/hns/personnel/appform/workholiapp/insertWorkHoliApp.json'),
  getWorkHoliDay: http.post('/hns/personnel/appform/workholiapp/getWorkHoliDay.json'),
  getWorkHoliDayView: http.post('/hns/personnel/appform/overtimeapp/getWorkHoliDayView.json'),
  execWorkHoliAppChk: http.post('/hns/personnel/appform/workholiapp/execWorkHoliAppChk.json')
}
