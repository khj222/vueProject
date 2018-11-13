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
  )
}
