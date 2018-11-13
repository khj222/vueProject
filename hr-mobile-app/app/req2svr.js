import http from '~/util/http'

export default {
  uploadFile: http.post('/uploadFile'),
  updatePasswordInit: http.post('/cmm/updatePasswordInit.json'),
  updatePassword: http.post('/cmm/updatePassword.json'),
  reqDeviceAuthSMS: http.post('/mhr/uat/reqDeviceAuthSMS.json')
}
