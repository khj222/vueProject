import http from '~/util/http'
export default {
  getEmpWorkHoliTamDay: http.post('/hns/personnel/appform/workholiapp/getEmpWorkHoliTamDay.json'),
  getRemainingDays: http.post('/hns/personnel/appform/workholiapp/getRemainingDays.json'),
  getWorkHoliAppList: http.post('/hns/personnel/appform/workholiapp/getWorkHoliAppList.json'),
  getOverTimeAppList: http.post('/hns/personnel/appform/overtimeapp/getOverTimeAppList.json'),
  getRestAppList: http.post('/hns/personnel/appform/restapp/getRestAppList.json'),
  getWorkLeavAppList: http.post('/hns/personnel/appform/workleavapp/getWorkLeavAppList.json'),
  reqWorkHoliApp: http.post('/hns/personnel/appform/workholiapp/reqWorkHoliApp.do'),
  getTamShiftInfo: http.post('/hns/personnel/appform/overtimeapp/getTamShiftInfo.json'),
  insertWorkHoliApp: http.post('/hns/personnel/appform/workholiapp/insertWorkHoliApp.json'),
  insertOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/insertOverTimeApp.json'),
  getWorkHoliDay: http.post('/hns/personnel/appform/workholiapp/getWorkHoliDay.json'),
  getWorkHoliDayView: http.post('/hns/personnel/appform/overtimeapp/getWorkHoliDayView.json'),
  reqOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/reqOverTimeApp.do'),
  execWorkHoliAppChk: http.post('/hns/personnel/appform/workholiapp/execWorkHoliAppChk.json'),
  execOverTimeAppChk: http.post('/hns/personnel/appform/overtimeapp/execOverTimeAppChk.json'),
  getCommonCodeIdxDtlList: http.post('/sym/program/getCommonCodeIdxDtlList.json')
}
