import http from '~/util/http'
export default {
  getSurveyList: http.post('/mhr/survey/list.json')
}
