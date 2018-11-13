import http from '~/util/http'

export default {
  pushUpdate: http.post('/mhr/push/pushUpdate.json')
}
