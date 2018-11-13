// function flatten(fn) {
//   let ret = {}
//   let rec = function(fns) {
//     if (!fns) return
//     fns.forEach(fn => {
//       ret[fn.function_id] = fn
//       rec(fn.children)
//     })
//   }
//   rec(fn)
//   return ret
// }

// function processUserInfo(userInfo) {
//   if (typeof userInfo.personal_function === 'string') {
//     userInfo.personal_function = JSON.parse(userInfo.personal_function || '[]')
//   }
//   userInfo.auth = flatten(userInfo.personal_function)
//   return userInfo
// }

export default function(req2svr) {
  return {
    state: {
      data: {}
    },
    mutations: {
      'user.data[set]'(state, data) {
        state.data = data
      }
    },
    actions: {
      'user[login]'(context, user) {
        return req2svr.login(user).then(r => {
          // console.log(r)
          if (r.action === 'OK') {
            // processUserInfo(r)
            context.commit('user.data[set]', r)
          }
          return r
        })
      },
      'user[logout]'({ rootState, commit }, context) {
        return req2svr.logout().then(r => {
          commit('user.data[set]', {})
          window.localStorage.setItem('isCoachMark', '')
          window.localStorage.setItem('last_time_mng_over', '')
          window.localStorage.setItem('last_time_push', '')
          window.localStorage.setItem('last_time_mng', '')
          window.localStorage.setItem('last_time_mng_plist', '')
          window.localStorage.setItem('last_time_edu_plist', '')
          window.localStorage.setItem('completedSurvey', '')
          rootState.overTimePListCnt = '0'
          rootState.pushListCnt = '0'
          rootState.mngCnt = '0'
          rootState.EMP_NO = ''
          rootState.EMP_NM = ''
          rootState.ORG_CD = ''
          rootState.PERSON_ID = ''
          rootState.push_yn = 'N'
          rootState.userBasicInfo = {}
          rootState.recentPush = {}
          rootState.ROLE = {}
          rootState.survList = []
        })
      },
      'user[check]'(context, data) {
        return req2svr
          .check(data)
          .then(r => {
            //  console.log(r.user_info)
            // processUserInfo(r)
            context.commit('user.data[set]', r)
            return r
          })
          .catch(e => {
            // 서버 비정상 응답도 로그인 안된것을 체크 성공 한 것이기 때문에 reject 하지 않음
            console.log(e)
            context.commit('user.data[set]', {})
          })
      }
    }
  }
}
