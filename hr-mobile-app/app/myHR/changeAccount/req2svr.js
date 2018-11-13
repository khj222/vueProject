import http from '~/util/http'

export default {
  getTargetUserPayCalcNoList: http.post(
    '/hns/pay/paymng/paycalcresult/getTargetUserPayCalcNoList.json'
  ),
  getPcmPayPerRstInfo: http.post(
    '/hns/pay/paymng/paycalcresult/getPcmPayPerRstInfo.json'
  ),
  getPayAcntChgInfo: http.post(
    '/hns/personnel/appform/payacntchg/getPayAcntChgInfo.json'
  ),
  insertPayAcntChg: http.post(
    '/hns/personnel/appform/payacntchg/insertPayAcntChg.json'
  ),
  uploadAppFiles: http.post('/commFile/uploadAppFiles.json'),
  getCommonCodeIdxDtlList: http.post(
    '/sym/program/getCommonCodeIdxDtlList.json'
  )
}
