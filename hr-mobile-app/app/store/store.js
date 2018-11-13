import user from './user/user'
import userReq2svr from './user/req2svr'
import moment from 'moment'

import eduConfirmList from '~/conf/eduConfirmList/eduConfirmList' // 교육 승인함
import confirmList from '~/conf/confirmList/confirmList' // 초과근무 승인함
import workConfirmList from '~/conf/workConfirmList/workConfirmList' // 근태 승인함

import vCalender from '~/myHR/vCalender/vCalender' // 근태 현황
import requestWork from '~/myHR/requestWork/requestWork' // 근태 신청
import requestOvertime from '~/myHR/requestOvertime/requestOvertime' // 초과 근무 신청
import requestList from '~/myHR/requestList/requestList' // 신청함
import tamShiftAppReq from '~/myHR/tamShiftAppReq/tamShiftAppReq' // 시차 출퇴근 신청
import changeAccount from '~/myHR/changeAccount/changeAccount' // 급여 계좌 변경
import payCalc from '~/myHR/payCalc/payCalc' // 급여 명세서
import monthList from '~/myHR/payCalc/monthList/monthList' // 월별 급여 현황

import eduCoseAList from '~/edu/eduCoseAList/eduCoseAList' // 교육 신청
import eduCoseList from '~/edu/eduCoseList/eduCoseList' // 사내 교육 목록
import eduCoseOpenList from '~/edu/eduCoseOpenList/eduCoseOpenList' // 교육 과정 목록 (사내교육목록->교육차수목록)
import eduDashBoard from '~/edu/eduDashBoard/eduDashBoard' // 교육 현황
import eduMyTuteList from '~/edu/eduMyTuteList/eduMyTuteList' // 교육 이력
import eduRequestList from '~/edu/eduRequestList/eduRequestList' // 교육 신청함
import eduServList from '~/edu/eduServList/eduServList' // 교육 만족도 조사

import survey from '~/survey/survey' // 설문조사

import pwChange from '~/password/change/change' // 비밀번호 변경
import noticeList from '~/noticeList/noticeList' // 알림함
import setting from '~/setting/setting' // 설정

export default function() {
  return {
    modules: {
      user: user(userReq2svr)
    },
    state: {
      child: {
        confirmList,
        monthList,
        changeAccount,
        requestWork,
        requestOvertime,
        requestList,
        noticeList,
        vCalender,
        payCalc,
        setting,
        pwChange,
        eduConfirmList,
        eduCoseAList,
        eduCoseList,
        eduCoseOpenList,
        eduDashBoard,
        eduMyTuteList,
        eduRequestList,
        eduServList,
        survey,
        tamShiftAppReq,
        workConfirmList
      },
      selectedDate: new Date().toString(),
      slideMoving: 0,
      slideShowTrueCount: 0,
      versionInfo: {},
      overTimePListCnt: '0',
      workPListCnt: '0',
      eduPListCnt: '0',
      pushListCnt: '0',
      mngCnt: '0',
      EMP_NO: '',
      EMP_NM: '',
      ORG_CD: '',
      PERSON_ID: '',
      push_yn: 'N',
      userBasicInfo: {},
      recentPush: {},
      ROLE: {},
      survList: [],
      popMenu: false,
      compSurveyList: [],
      eventBus: new Vue()
    },
    getters: {
      getCompSurveyList: state => {
        try {
          state.compSurveyList = JSON.parse(window.localStorage.getItem('completedSurvey')) || []
        } catch (err) {
          state.compSurveyList = []
        }

        return state.compSurveyList
      },
      getSelectedDate: function(state) {
        return state.selectedDate
      },
      getVersionInfo: state => {
        return state.versionInfo
      }
    },
    actions: {
      getSurveyList({ state, commit }, context) {
        return userReq2svr.getSurveyList({}).then(r => {
          if (r.data && r.data.length > 0) {
            return r.data
          }
        })
      },
      setStorageCnt(context, { item, storegeKey }) {
        let a = parseInt(window.localStorage.getItem(storegeKey))
        let key
        let func
        if (storegeKey === 'last_time_mng') {
          key = item.REQ_YMD
          func = 'getAppApprMngListCnt'
        } else if (storegeKey === 'last_time_mng_over') {
          key = item.REQ_NO
          func = 'getAppApprMngOverTimePListCnt'
        } else if (storegeKey === 'last_time_push') {
          a = window.localStorage.getItem(storegeKey)
          key = item.PUSH_DATE
          func = 'getPushListCnt'
        } else if (storegeKey === 'last_time_mng_plist') {
          key = item.REQ_NO
          func = 'getAppApprMngPListCnt'
        } else if (storegeKey === 'last_time_edu_plist') {
          key = item.APP_DATE
          func = 'getEduTuteApprPListCnt'
        }
        let diff = moment(key).diff(moment(a)) || 1
        if (diff > 0) {
          window.localStorage.setItem(storegeKey, key)
          this.dispatch(func)
        }
      },
      versionCheck({ state, commit }, context) {
        return new Promise(resolve => {
          window.cordova.getAppVersion.getVersionNumber().then(v => {
            userReq2svr
              .versionCheck({
                version: v
              })
              .then(r => {
                commit('versionInfo[set]', r)
                resolve()
              })
          })
        })
      },
      calculateCnt(context, { r, storegeKey }) {
        // console.log(r)
        let x = parseInt(window.localStorage.getItem(storegeKey))
        let lengthArr = []
        if (x) {
          lengthArr = _.filter(r.data, (v, i) => {
            if (storegeKey === 'last_time_mng') {
              return moment(v.REQ_YMD) > moment(x)
            } else if (
              storegeKey === 'last_time_mng_over' ||
              storegeKey === 'last_time_mng_plist'
            ) {
              return parseInt(v.REQ_NO) > x
            } else if (storegeKey === 'last_time_push') {
              return moment(v.PUSH_DATE) > moment(window.localStorage.getItem(storegeKey))
            } else if (storegeKey === 'getEduTuteApprPListCnt') {
              return moment(v.APP_DATE) > moment(x)
            }
          })
        } else {
          lengthArr = r.data
        }
        if (lengthArr.length >= 9) {
          return '9+'
        }
        return lengthArr.length
      },
      getPushListCnt({ state, commit }, context) {
        return userReq2svr.pushList({ pageSize: 10, pageIndex: 1 }).then(r => {
          if (r.data && r.data.length > 0) {
            state.recentPush = r.data[0]

            this.dispatch('calculateCnt', {
              r,
              storegeKey: 'last_time_push'
            }).then(rs => {
              state.pushListCnt = rs
            })
          }
        })
      },
      getEduTuteApprPListCnt({ state, commit }, context) {
        return userReq2svr
          .getEduTuteApprPList({
            ORDER_BY_SEQ: '2',
            APPR_MODE: 'P',
            SEARCH_APP_YMD_STA_DATE: moment()
              .startOf('day')
              .add(-6, 'month')
              .format('YYYY-MM-DD'),
            SEARCH_APP_YMD_END_DATE: moment().format('YYYY-MM-DD'),
            SEARCH_COSE_NM: '',
            SEARCH_EMP_NO: '',
            SEARCH_EMP_NM: '',
            SEARCH_PERSON_ID: '',
            SEARCH_DUTY_EXPL_NM: '',
            SEARCH_APP_STAT_CD: '100',
            pageIndex: 1
          })
          .then(r => {
            if (r.data) {
              this.dispatch('calculateCnt', {
                r,
                storegeKey: 'last_time_edu_plist'
              }).then(rs => {
                state.eduPListCnt = rs
              })
            }
          })
      },
      getAppApprMngPListCnt({ state, commit }, context) {
        return userReq2svr
          .getAppApprMngPList({
            EXCEL_FILE_NAME: '',
            EXCEL_TITLE: '',
            EXCEL_HEADER: '',
            SEARCH_APPL_CD: '100004',
            APPR_CLS: 'P',
            SEARCH_ORG_CD: '',
            I_SRCH_AUTH: '',
            SEARCH_PERSON_ID: '',
            SEARCH_EMP_NO: '',
            SEARCH_EMP_NM: '',
            SEARCH_APPL_CHK: 'N',
            SEARCH_STA_DATE: moment()
              .startOf('day')
              .add(-2, 'month')
              .format('YYYY-MM-DD'),
            SEARCH_END_DATE: moment()
              .startOf('day')
              .add(1, 'month')
              .format('YYYY-MM-DD'),
            pageIndex: 1
          })
          .then(r => {
            if (r.data) {
              this.dispatch('calculateCnt', {
                r,
                storegeKey: 'last_time_mng_plist'
              }).then(rs => {
                state.workPListCnt = rs
              })
            }
          })
      },
      getAppApprMngOverTimePListCnt({ state, commit }, context) {
        return userReq2svr
          .getAppApprMngOverTimePList({
            EXCEL_FILE_NAME: '',
            EXCEL_TITLE: '',
            EXCEL_HEADER: '',
            SEARCH_APPL_CD: '100003',
            APPR_CLS: 'P',
            SEARCH_PERSON_ID: '',
            SEARCH_EMP_NO: '',
            SEARCH_EMP_NM: '',
            SEARCH_TRG_PERSON_ID: '',
            SEARCH_TRG_EMP_NO: '',
            SEARCH_TRG_EMP_NM: '',
            SEARCH_APPL_CHK: 'N',
            SEARCH_STA_YMD: moment()
              .startOf('day')
              .add(-2, 'month')
              .format('YYYY-MM-DD'),
            SEARCH_END_YMD: moment()
              .startOf('day')
              .add(1, 'month')
              .format('YYYY-MM-DD'),
            pageIndex: 1
          })
          .then(r => {
            if (r.data) {
              this.dispatch('calculateCnt', {
                r,
                storegeKey: 'last_time_mng_over'
              }).then(rs => {
                state.overTimePListCnt = rs
              })
            }
          })
      },
      getAppApprMngListCnt({ state, commit }, context) {
        return userReq2svr
          .getAppApprMngList({
            SEARCH_APPL_CD: '',
            APPR_CLS: '',
            TO_DATE: moment().format('YYYY-MM-DD'),
            SEARCH_PERSON_ID: state.PERSON_ID,
            SEARCH_EMP_NO: state.EMP_NO,
            SEARCH_EMP_NM: state.EMP_NM,
            SEARCH_STA_DATE: moment()
              .add(-1, 'month')
              .format('YYYY-MM-DD'),
            SEARCH_END_DATE: moment().format('YYYY-MM-DD'),
            SEARCH_APPL_STAT: '',
            pageIndex: 1
          })
          .then(r => {
            if (r.data) {
              this.dispatch('calculateCnt', {
                r,
                storegeKey: 'last_time_mng'
              }).then(rs => {
                state.mngCnt = rs
              })
            }
          })
      },
      getCountList({ state, commit }, listId) {
        // listId = 'CONFIRMLIST' or 'REQUESTLIST'
        let a = state.ROLE.new
        let b = _.filter(a, v => {
          return v.id.toUpperCase().indexOf(listId) > -1
        })
        if (b.length > 1) state.popMenu = true
      }
    },
    mutations: {
      'compSurveyList[set]'(state, data) {
        window.localStorage.setItem('completedSurvey', JSON.stringify(data))
        state.compSurveyList = data
      },
      'ROLE[set]'(state, data) {
        state.ROLE = data
      },
      'ORG_CD[set]'(state, data) {
        state.ORG_CD = data
      },
      'push_yn[set]'(state, data) {
        state.push_yn = data
      },
      'EMP_NO[set]'(state, data) {
        state.EMP_NO = data
      },
      'EMP_NM[set]'(state, data) {
        state.EMP_NM = data
      },
      'PERSON_ID[set]'(state, data) {
        state.PERSON_ID = data.toString()
      },
      'userBasicInfo[set]'(state, data) {
        state.userBasicInfo = data
      },
      'versionInfo[set]'(state, data) {
        state.versionInfo = data
      },
      'slideMoving[set]'(state, data) {
        state.slideMoving = data
      },
      'slideShowTrueCount[increase]'(state) {
        state.slideShowTrueCount++
      },
      'slideShowTrueCount[decrease]'(state) {
        state.slideShowTrueCount--
      }
    }
  }
}
