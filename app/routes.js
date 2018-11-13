import login from './login/login.js'
import main from './main/main.js'

export default [
  {path: '/', redirect: '/main'},
  {path: '/login', component: login},
  {path: '/main', component: main},
  {path: '*', redirect: '/main'}
]
