import http from '~/util/http'
export default {
  getAppApprMngList: http.post('/hns/personnel/appform/appapprmng/getAppApprMngList.json'),
  reqOverTimeApp: http.post('/hns/personnel/appform/overtimeapp/reqOverTimeApp.do'),
  getTamShiftInfo: http.post('/hns/personnel/appform/overtimeapp/getTamShiftInfo.json'),
  reqWorkHoliApp: http.post('/hns/personnel/appform/workholiapp/reqWorkHoliApp.do'),
  popPayAcntChgView: http.post('/hns/personnel/appform/payacntchg/popPayAcntChgView.do'),
  downloadAppFiles: http.post('/commFile/downloadAppFiles.do'),
  tamShiftAppReqPop: http.post('/hns/personnel/appform/tamshiftapp/tamShiftAppReqPop.do')
}
