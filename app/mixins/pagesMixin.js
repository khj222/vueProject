import confirmList from '~/conf/confirmList/confirmList'
import noticeList from '~/noticeList/noticeList'
import survey from '~/survey/survey' // 설문조사

import Vue from 'vue'
import _ from 'lodash'

export let pages = {
  survey: {
    class: 'ctg_yg',
    id: 'surveyId',
    category: '설문조사',
    vm: survey
  },
  confirmList: {
    class: 'ctg_yg',
    id: 'confirmId',
    category: '승인함',
    vm: confirmList
  },
  noticeList: {
    class: 'ctg_yg',
    id: 'noticeId',
    category: '알림함',
    vm: noticeList
  }
}
export let staffPages = _.pick(pages, ['confirmList', 'noticeList', 'survey'])

let getPage = function(name) {
  return staffPages[name] || {}
}
let getPopupOption = function(pageInfo) {
  if (!pageInfo) return
  let page = getPage.call(this, pageInfo)
  return page.vm && [page.vm, Object.assign({}, pageInfo, { [page.id]: pageInfo.id })]
}
export default {
  computed: {
    pages() {
      return {
        getPage: name => getPage.call(this, name),
        getPopupOption: pageInfo => getPopupOption.call(this, pageInfo)
      }
    }
  },
  mounted() {
    Vue.pages = this.pages
  }
}
