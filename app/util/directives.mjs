import Vue from 'vue'

Vue.directive('close', {
  bind (el, binding, vnode) {
    vnode.context['$_v-close:' + binding.expression] = binding.value // 컴포넌트 인스턴스 변수를 빌어 저장
    el.addEventListener('click', e => {
      vnode.context.$emit('closePop', !binding.modifiers.reject, vnode.context['$_v-close:' + binding.expression])
    })
  },
  update (el, binding, vnode, oldVnode) {
    vnode.context['$_v-close:' + binding.expression] = binding.value
  },
  unbind (el, binding, vnode) {
    vnode.context['$_v-close:' + binding.expression] = undefined
  }
})

Vue.directive('narrow', (el) => {
  Vue.nextTick(() => {
    if (el.textContent && el.textContent.length <= 3) {
      el.classList.add('narrow')
    } else {
      el.classList.remove('narrow')
    }
  })
})

Vue.directive('ripple', {
  bind (el, binding) {
    if (binding.value === false) return
    let div = document.createElement('div')
    div.setAttribute('class', 'rippleJS')
    el.appendChild(div)
  }
})
