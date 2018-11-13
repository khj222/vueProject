import http from '~/util/http'

export default {
  pushList: http.post('/mhr/push/pushList.json')
}
